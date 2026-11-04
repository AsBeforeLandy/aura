import React from 'react';
import { BarChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', profit: 420 },
  { month: '2月', profit: -180 },
  { month: '3月', profit: 560 },
  { month: '4月', profit: -90 },
  { month: '5月', profit: 720 },
  { month: '6月', profit: -240 },
];

const Demo: React.FC = () => (
  <BarChart
    data={data}
    xKey="month"
    height={300}
    series={[{ key: 'profit', name: '盈亏（万元）' }]}
  />
);

export default Demo;
