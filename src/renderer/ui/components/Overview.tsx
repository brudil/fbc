import React from 'react';
import { Line } from 'react-chartjs-2';
import { StandardView } from './StandardView';
import { useAnalyser } from '../hooks/useAnalyser';
import {
  totalSentMessages,
  percentOfMessagesSelf,
  biggestChats,
  selfMessagesByMonth,
  selfTrendByMonth,
} from '../../../lib/analysers/analysers';
import { StatBox } from './StatBox';
import styled from '@emotion/styled';
import { bigNumber } from '../../../lib/valueFormatters';

interface OverviewProps {}

const StatsGrid = styled.ul({
  display: 'flex',
  flexWrap: 'wrap',
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

export const Overview = (props: OverviewProps) => {
  const totalSent = useAnalyser(totalSentMessages);
  const percentageSelf = useAnalyser(percentOfMessagesSelf);
  const chatsBySize = useAnalyser(biggestChats);
  const selfMessages = useAnalyser(selfMessagesByMonth);
  const xoxo = useAnalyser(selfTrendByMonth('xoxo'));
  const babe = useAnalyser(selfTrendByMonth('babe'));

  return (
    <StandardView>
      <StatsGrid>
        <StatBox
          value={totalSent}
          subline="messages sent"
          formatter={bigNumber}
        />
        <StatBox
          value={percentageSelf}
          subline="chatterboxing"
          formatter={(v) => `${v}%`}
        />
        <StatBox
          value={chatsBySize}
          subline="largest chat"
          formatter={(v) => v[0].title}
          fitText
        />
      </StatsGrid>

      {xoxo.data === null || babe.data === null ? null : (
        <Line
          data={{
            labels: babe.data.map((m) => m.my),
            datasets: [
              {
                label: 'xoxo',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: '#EE79BD',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: xoxo.data.map((m) => m.total),
              },
              {
                label: 'babe',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: '#EE110C',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: babe.data.map((m) => m.total),
              },
            ],
          }}
        />
      )}

      {selfMessages.data === null ? null : (
        <Line
          data={{
            labels: selfMessages.data.map((m) => m.my),
            datasets: [
              {
                label: 'Your messages',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: selfMessages.data.map((m) => m.total),
              },
            ],
          }}
        />
      )}

      {selfMessages.data === null ? null : (
        <Line
          data={{
            labels: selfMessages.data.map((m) => m.my),
            datasets: [
              {
                label: 'Your messages',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: selfMessages.data
                  .reduce(
                    (a, m) => {
                      a.push(m.total + a[a.length - 1]);
                      return a;
                    },
                    [0],
                  )
                  .slice(1),
              },
            ],
          }}
        />
      )}
    </StandardView>
  );
};
