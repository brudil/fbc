import { Analyser } from './Analyser';
import { Table } from '../store';
import { timeSeriesInflator, seriesBookends } from '../timeUtils';
import { QueryBuilder } from 'knex';

export const analyseTotalSentMessages: Analyser<number> = async (data) => {
  const count = await data
    .db(Table.Messages)
    .innerJoin(
      Table.ThreadParticipants,
      `${Table.Messages}.participant`,
      `${Table.ThreadParticipants}.id`,
    )
    .where({
      friend: 1,
    })
    .count({ total: `${Table.Messages}.id` });

  return count[0].total;
};

export const analyseTotalMessages: Analyser<number> = async (data) => {
  const count = await data
    .db(Table.Messages)
    .innerJoin(
      Table.ThreadParticipants,
      `${Table.Messages}.participant`,
      `${Table.ThreadParticipants}.id`,
    )
    .count({ total: `${Table.Messages}.id` });

  return count[0].total;
};

export const analysePercentOfMessagesSelf: Analyser<number> = async (data) => {
  const total = await analyseTotalMessages(data);
  const self = await analyseTotalSentMessages(data);

  return Math.round((self / total) * 1000) / 10;
};

export const analyseBiggestChats: Analyser<{
  total: number;
  title: string;
}> = async (data) => {
  const result = await data
    .db(Table.Threads)
    .innerJoin(
      Table.Messages,
      `${Table.Threads}.id`,
      `${Table.Messages}.thread`,
    )
    .select('title')
    .count({ total: `${Table.Messages}.id` })
    .groupBy(`${Table.Threads}.id`)
    .orderBy('total', 'desc');

  return result;
};

export const analyseSelfMessagesByMonth: Analyser<any[]> = async (data) => {
  const result = await data
    .db(Table.Messages)
    .innerJoin(
      Table.ThreadParticipants,
      `${Table.Messages}.participant`,
      `${Table.ThreadParticipants}.id`,
    )
    .select(
      data.db.raw(
        `*, strftime("%m-%Y", datetime(messages.timestamp / 1000, 'unixepoch')) as "my"`,
      ),
    )
    .where({
      'thread_participants.friend': 1,
    })
    .count({ total: `${Table.Messages}.id` })
    .groupByRaw(`my`)
    .orderBy('messages.timestamp');

  return result;
};

export const analyseSelfTrendByMonth = (
  term: string,
  dbPiper = (query: QueryBuilder) => query,
) =>
  (async (data) => {
    const result = await dbPiper(
      data
        .db(Table.Messages)
        .innerJoin(
          Table.ThreadParticipants,
          `${Table.Messages}.participant`,
          `${Table.ThreadParticipants}.id`,
        )
        .select(
          data.db.raw(
            `messages.timestamp as ts, *, strftime("%m-%Y", datetime(messages.timestamp / 1000, 'unixepoch')) as "my"`,
          ),
        ),
    )
      .where('messages.content', 'like', `%${term}%`)
      .count({ total: `${Table.Messages}.id` })
      .groupByRaw(`my`)
      .orderBy('messages.timestamp');

    return result;
  }) as Analyser<{ ts: number; total: number }[]>;

export interface TrendData {
  points: {
    week: Date;
    trends: number[];
  }[];
  labels: string[];
}

export const analyseSelfTrendsByMonth = (
  options: { normalise: boolean },
  ...terms: string[]
) =>
  (async (data) => {
    const trends = await Promise.all(
      terms.map((term) => analyseSelfTrendByMonth(term)(data)),
    );

    const [start, end] = seriesBookends(trends);

    return {
      points: timeSeriesInflator('month', ...trends),
      labels: terms,
    };
  }) as Analyser<TrendData>;
