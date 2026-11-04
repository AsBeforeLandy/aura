import React from 'react';
import { RadarChart } from '@aura-react-comp/charts';

const indicators = [
  { name: '销售', max: 500 },
  { name: '营销', max: 500 },
  { name: '研发', max: 500 },
  { name: '客服', max: 500 },
  { name: '运营', max: 500 },
];

const Demo: React.FC = () => (
  <RadarChart
    height={320}
    levels={5}
    indicators={indicators}
    series={[
      { key: 'q1', name: 'Q1', values: [320, 180, 420, 260, 300] },
      { key: 'q2', name: 'Q2', values: [380, 240, 460, 300, 340] },
      { key: 'q3', name: 'Q3', values: [260, 380, 440, 340, 420] },
    ]}
  />
);

export default Demo;
