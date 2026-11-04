import React from 'react';
import { LineChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', pv: 3200, uv: 1800 },
  { month: '2月', pv: 2800, uv: 1500 },
  { month: '3月', pv: 4100, uv: 2300 },
  { month: '4月', pv: 5200, uv: 2900 },
  { month: '5月', pv: 4800, uv: 2600 },
  { month: '6月', pv: 6100, uv: 3400 },
];

const Demo: React.FC = () => (
  <LineChart
    data={data}
    xKey="month"
    height={300}
    smooth
    area
    stack
    series={[
      { key: 'pv', name: '浏览量（PV）' },
      { key: 'uv', name: '访客数（UV）' },
    ]}
  />
);

export default Demo;
