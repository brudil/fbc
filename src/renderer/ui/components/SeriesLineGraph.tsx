import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendData } from '../../../lib/analysers/analysers';

interface SeriesLineGraphProps {
  series: TrendData;
  xFormatter(x: any): string;
}

const colors = [
  '#AAFF00',
  '#FFAA00',
  '#FF00AA',
  '#AA00FF',
  '#00AAFF',
  '#2C2D3C',
];

export const SeriesLineGraph: React.FC<SeriesLineGraphProps> = ({
  series,
  xFormatter,
}) => {
  return (
    <Line
      data={{
        labels: series.points.map(xFormatter),
        datasets: series.labels.map((x, i) => ({
          label: series.labels[i],
          fill: false,
          lineTension: 0.1,
          backgroundColor: colors[i],
          borderColor: colors[i],
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: colors[i],
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: colors[i],
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: series.points.map((m) => m.trends[i]),
        })),
      }}
    />
  );
};
