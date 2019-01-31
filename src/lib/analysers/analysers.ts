import { Analyser } from "./Analyser";
import { Table } from "../store";

export const totalSentMessages: Analyser<number> = async(data) => {

    const count = await data.db(Table.Messages)
        .innerJoin(Table.ThreadParticipants, `${Table.Messages}.participant`, `${Table.ThreadParticipants}.id`)
        .where({
            friend: 1,
        })
        .count({ total: `${Table.Messages}.id` });

    return count[0].total;
}

export const totalMessages: Analyser<number> = async(data) => {

    const count = await data.db(Table.Messages)
        .innerJoin(Table.ThreadParticipants, `${Table.Messages}.participant`, `${Table.ThreadParticipants}.id`)
        .count({ total: `${Table.Messages}.id` });

    return count[0].total;
}

export const percentOfMessagesSelf: Analyser<number> = async(data) => {
    const total = await totalMessages(data);
    const self = await totalSentMessages(data);

    return (Math.round((self / total) * 1000)) / 10;
}

export const biggestChats: Analyser<{ total: number, title: string }> = async(data) => {
    const result = await data.db(Table.Threads).innerJoin(Table.Messages, `${Table.Threads}.id`, `${Table.Messages}.thread`)
        .select('title')
        .count({total: `${Table.Messages}.id`})
        .groupBy(`${Table.Threads}.id`)
        .orderBy('total', 'desc');

    return result
}

export const selfMessagesByMonth: Analyser<any[]> = async(data) => {
    const result = await data.db(Table.Messages)
        .innerJoin(Table.ThreadParticipants, `${Table.Messages}.participant`, `${Table.ThreadParticipants}.id`)
        .select(data.db.raw(`*, strftime("%m-%Y", datetime(messages.timestamp / 1000, 'unixepoch')) as "my"`))
        .where({
            'thread_participants.friend': 1,
        })
        .count({total: `${Table.Messages}.id`})
        .groupByRaw(`my`)
        .orderBy('messages.timestamp')

    return result;
}

export const selfTrendByMonth = (term: string) => (async(data) => {
    const result = await data.db(Table.Messages)
        .innerJoin(Table.ThreadParticipants, `${Table.Messages}.participant`, `${Table.ThreadParticipants}.id`)
        .select(data.db.raw(`*, strftime("%m-%Y", datetime(messages.timestamp / 1000, 'unixepoch')) as "my"`))
        .where({
            'thread_participants.friend': 1,
        })
        .where('messages.content', 'like', `%${term}%`)
        .count({total: `${Table.Messages}.id`})
        .groupByRaw(`my`)
        .orderBy('messages.timestamp')

    return result;
}) as Analyser<any[]>