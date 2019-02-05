import {
  isWithinInterval,
  isSameMonth,
  addMonths,
  setDay,
  setDate,
  eachWeekOfInterval,
} from 'date-fns';
import { totalmem } from 'os';
export const filterToMonths = (weeks: Date[]) => {
  const filtered: Date[] = [];

  weeks.forEach((week, i) => {
    if (i <= 0) {
      filtered.push(setDay(week, 1));
      return;
    }

    const prev = filtered[filtered.length - 1];

    if (!isSameMonth(week, prev)) {
      filtered.push(setDate(week, 1));
    }
  });

  return filtered;
};

export const seriesBookends = (trendData: { ts: number }[][]) => {
  const currentStarts = trendData.map((trend) => trend[0].ts);
  const currentEnds = trendData.map((trend) => trend[trend.length - 1].ts);

  const firstStart = Math.min(...currentStarts);
  const lastEnd = Math.max(...currentEnds);

  return [firstStart, lastEnd];
};

export function timeSeriesInflator(
  interval: 'month' | 'week' | 'day',
  ...trendData: { ts: number; total: number }[][]
) {
  if (trendData.filter((x) => x === null).length > 0) {
    return;
  }

  const [firstStart, lastEnd] = seriesBookends(trendData);

  const startDate = new Date(firstStart);
  const endDate = new Date(lastEnd);

  const currentIndexOfTrend = Array(trendData.length).fill(0);

  const weeksPrefilter = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 },
  );

  const weeks = filterToMonths(weeksPrefilter);

  console.log(weeks);

  const final: { week: Date; trends: number[] }[] = [];

  weeks.forEach((week) => {
    const finalWeek: number[] = [];
    trendData.forEach((trend, i) => {
      const currentPoint = trend[currentIndexOfTrend[i]];
      console.log({ currentPoint });
      if (
        currentPoint !== undefined &&
        isWithinInterval(new Date(currentPoint.ts), {
          start: week,
          end: addMonths(week, 1),
        })
      ) {
        finalWeek.push(currentPoint.total);
        currentIndexOfTrend[i] = currentIndexOfTrend[i] + 1;
      } else {
        finalWeek.push(0);
      }
    });

    final.push({
      week,
      trends: finalWeek,
    });
  });

  return final;
}
