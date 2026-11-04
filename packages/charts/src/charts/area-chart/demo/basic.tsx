import React from 'react';
import { AreaChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', newUser: 820, active: 1900 },
  { month: '2月', newUser: 690, active: 1750 },
  { month: '3月', newUser: 1100, active: 2200 },
  { month: '4月', newUser: 1350, active: 2600 },
  { month: '5月', newUser: 980, active: 2450 },
  { month: '6月', newUser: 1420, active: 2900 },
];

const Demo: React.FC = () => (
  <AreaChart
    data={data}
    xKey="month"
    height={300}
    series={[{ key: 'active', name: '活跃用户' }]}
  />
);

export default Demo;
