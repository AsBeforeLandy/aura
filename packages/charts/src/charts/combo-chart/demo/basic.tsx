import React from 'react';
import { ComboChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', revenue: 320, rate: 12 },
  { month: '2月', revenue: 280, rate: 15 },
  { month: '3月', revenue: 410, rate: 18 },
  { month: '4月', revenue: 520, rate: 22 },
  { month: '5月', revenue: 480, rate: 19 },
  { month: '6月', revenue: 610, rate: 26 },
];

const Demo: React.FC = () => (
  <ComboChart
    data={data}
    xKey="month"
    height={300}
    series={[
      { key: 'revenue', name: '营收（万）', type: 'bar' },
      { key: 'rate', name: '增长率（%）', type: 'line', curve: 'smooth' },
    ]}
  />
);

export default Demo;
