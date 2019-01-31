import { join } from 'path';
import { inspectTreeAsync, readAsync } from 'fs-jetpack';
import { InspectTreeResult } from 'fs-jetpack/types';
import Knex from 'knex';
import {
  ParticipantData,
  Participant,
  MessageData,
  Message,
  ThreadDataFile,
} from './dataTypes';
import { Progressor } from './Progressor';

export interface Data {
  db: null | Knex;
}

const db = Knex({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite',
  },
  useNullAsDefault: true,
});

export enum Table {
  Friends = 'friends',
  Threads = 'threads',
  ThreadParticipants = 'thread_participants',
  Messages = 'messages',
}

async function buildSchema() {
  await db.schema.dropTableIfExists(Table.Friends);
  await db.schema.dropTableIfExists(Table.Threads);
  await db.schema.dropTableIfExists(Table.ThreadParticipants);
  await db.schema.dropTableIfExists(Table.Messages);

  await db.schema.createTable(Table.Friends, (table) => {
    table.increments();
    table.string('contact_info');
    table.string('name');
    table.dateTime('timestamp');
  });

  await db.schema.createTable(Table.Threads, (table) => {
    table.increments();
    table.string('title');
    table.boolean('is_still_participant');
    table.string('type');
    table.string('path');
    table.dateTime('timestamp');
  });

  await db.schema.createTable(Table.ThreadParticipants, (table) => {
    table.increments();
    table.string('name');
    table
      .integer('friend')
      .unsigned()
      .nullable();
    table.foreign('friend').references('friends.id');
    table.integer('thread').unsigned();
    table.foreign('thread').references('threads.id');
    table.dateTime('timestamp');
    table.boolean('has_left');
  });

  await db.schema.createTable(Table.Messages, (table) => {
    table.increments();

    table.integer('participant').unsigned();
    table.foreign('participant').references('participants.id');
    table.integer('thread').unsigned();
    table.foreign('thread').references('thread.id');
    table.dateTime('timestamp');
    table.string('type');
    table.string('content');
  });
}

function findDir(name: string, t: InspectTreeResult): InspectTreeResult {
  const found = Array.from(t.children.values()).find((v) => v.name === name);
  if (!found) {
    throw new Error(`can not find ${name}`);
  }
  return found;
}

function findFile(name: string, t: InspectTreeResult): InspectTreeResult {
  const found = Array.from(t.children.values()).find((v) => v.name === name);
  if (!found) {
    throw new Error(`can not find ${name}`);
  }
  return found;
}

function notUndefined(
  x: InspectTreeResult | undefined,
): x is InspectTreeResult {
  return x !== undefined;
}

async function loadFriends(path: string, tree: InspectTreeResult) {
  const friendsFile = findFile('friends.json', findDir('friends', tree));

  const data = await readAsync(join(path, friendsFile.relativePath), 'json');

  await db.batchInsert('friends', data.friends, 30);
}

async function findSingleFriend(name: string) {
  const result = await db
    .where({
      name,
    })
    .select()
    .from(Table.Friends);

  return result.length > 0 ? result[0] : null;
}

export async function addLeftParticipant(name: string, thread: number) {
  const friend = await findSingleFriend(name);

  const result = await db(Table.ThreadParticipants).insert({
    thread: thread,
    friend: friend ? friend.id : null,
    name: name,
    has_left: true,
  });

  return await db(Table.ThreadParticipants).where({
    id: result[0],
  });
}

export async function databaseExists() {
  const hasTable = await db.schema.hasTable(Table.Messages);

  if (hasTable) {
    return db;
  }

  return null;
}

export async function loadData(
  path: string,
  progressor: Progressor,
): Promise<Data> {
  await buildSchema();

  progressor.builtSchema();

  const tree = await inspectTreeAsync(path, { relativePath: true });

  if (!tree) {
    throw new Error('no folder found');
  }

  // annoying to type rn
  const profile: any = await readAsync(
    join(
      path,
      findFile('profile_information.json', findDir('profile_information', tree))
        .relativePath,
    ),
    'json',
  );

  await db(Table.Friends).insert({
    name: profile.profile.name.full_name,
    timestamp: profile.profile.registration_timestamp,
  });

  await loadFriends(path, tree);

  progressor.loadedFriends();

  const inbox = findDir('inbox', findDir('messages', tree));

  const allMessageFiles = inbox.children
    .filter((m) => m.children !== undefined)
    .map((m) => m.children.find((i) => i.name === 'message.json'))
    .filter(notUndefined);

  const loadMessageThread = async (item: InspectTreeResult) => {
    const messagePath = join(path, item.relativePath);

    const file = await readAsync(messagePath, 'json');

    return file;
  };

  const messageThreads = await Promise.all(
    allMessageFiles.map(loadMessageThread),
  );

  progressor.loadedThreads();

  const totalMessages = messageThreads.reduce(
    (prev: number, thread: ThreadDataFile) => prev + thread.messages.length,
    0,
  );
  progressor.setMessages(totalMessages);

  await Promise.all(
    messageThreads.map(async (thread) => {
      const threadRow = await db(Table.Threads).insert({
        title: thread.title,
        is_still_participant: thread.is_still_participant,
        type: thread.thread_type,
        path: thread.thread_path,
        timestamp: thread.messages[thread.messages.length - 1].timestamp_ms,
      });

      const participantsIds = await Promise.all(
        thread.participants.map(async (participant: ParticipantData) => {
          const asFriend = await findSingleFriend(participant.name);

          const result = await db(Table.ThreadParticipants).insert({
            thread: threadRow[0],
            friend: asFriend ? asFriend.id : null,
            name: participant.name,
            has_left: false,
          });

          return result[0];
        }),
      );

      // @ts-ignore
      const participants = await db(Table.ThreadParticipants).whereIn(
        'id',
        participantsIds,
      );

      const participantMap: { [name: string]: Participant } = {};

      participants.forEach((participant: Participant) => {
        participantMap[participant.name] = participant;
      });

      const insertMessages: Message[] = [];

      let unknownUser: null | Participant = null;

      await Promise.all(
        thread.messages.map(async (message: MessageData) => {
          let p = participantMap.hasOwnProperty(message.sender_name)
            ? participantMap[message.sender_name].id
            : null;

          if (p === null) {
            const isUnknownUser = message.sender_name === undefined;

            if (isUnknownUser) {
              if (unknownUser === null) {
                unknownUser = await addLeftParticipant(
                  'Unknown user',
                  threadRow[0],
                );
              }

              p = (unknownUser as Participant).id;
            } else {
              const part: Participant = await addLeftParticipant(
                message.sender_name,
                threadRow[0],
              );
              p = part.id;
            }
          }

          return insertMessages.push({
            participant: p,
            thread: threadRow[0],
            timestamp: message.timestamp_ms,
            type: message.type,
            content: message.content,
          });
        }),
      );

      // sqlite has 999 max varibles, we use 5 above, so just a little shy of 200
      await db.batchInsert(Table.Messages, insertMessages, 199);

      console.log(
        `inserted ${insertMessages.length} messages in to ${thread.title}`,
      );
      progressor.doneThread(insertMessages.length, thread.title);
    }),
  );

  return {
    db,
  };

  // const ally = messageThreads.find(t => t.title === 'Frida and Chris');
  // const people = ally.participants.map((p: any) => p.name);
  // console.log('total', ally.messages);
  // people.forEach((name: string) => {
  //     const mess = ally.messages.filter((m: any) => m.sender_name === name);

  //     console.log(name, mess.length);
  // })
}
