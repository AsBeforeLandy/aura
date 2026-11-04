import React from 'react';
import { ComboChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', revenue: 320, cost: 180, rate: 12 },
  { month: '2月', revenue: 280, cost: 210, rate: 15 },
  { month: '3月', revenue: 410, cost: 240, rate: 18 },
  { month: '4月', revenue: 520, cost: 300, rate: 22 },
];

const Demo: React.FC = () => (
  <ComboChart
    data={data}
    xKey="month"
    height={300}
    series={[
      { key: 'revenue', name: '营收', type: 'bar' },
      { key: 'cost', name: '成本', type: 'bar' },
      {
        key: 'rate',
        name: '增长率',
        type: 'line',
        curve: 'smooth',
        area: true,
      },
    ]}
  />
);

export default Demo;
