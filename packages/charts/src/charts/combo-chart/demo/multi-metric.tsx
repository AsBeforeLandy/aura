import React from 'react';
import { ComboChart } from '@aura-react-comp/charts';

const data = [
  { day: '周一', order: 320, avg: 128 },
  { day: '周二', order: 280, avg: 142 },
  { day: '周三', order: 410, avg: 136 },
  { day: '周四', order: 520, avg: 158 },
  { day: '周五', order: 610, avg: 172 },
  { day: '周六', order: 480, avg: 165 },
  { day: '周日', order: 390, avg: 150 },
];

const Demo: React.FC = () => (
  <ComboChart
    data={data}
    xKey="day"
    height={300}
    series={[
      { key: 'order', name: '订单量', type: 'bar' },
      { key: 'avg', name: '客单价', type: 'line', showSymbol: true },
    ]}
  />
);

export default Demo;
