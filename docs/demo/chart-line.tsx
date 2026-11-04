import React from 'react';
import { LineChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', orders: 1240, refunds: 280 },
  { month: '2月', orders: 980, refunds: 210 },
  { month: '3月', orders: 1560, refunds: 340 },
  { month: '4月', orders: 1890, refunds: 420 },
  { month: '5月', orders: 2210, refunds: 380 },
  { month: '6月', orders: 1980, refunds: 460 },
  { month: '7月', orders: 2450, refunds: 510 },
];

const Demo: React.FC = () => (
  <LineChart
    data={data}
    xKey="month"
    height={300}
    series={[
      { key: 'orders', name: '订单量' },
      { key: 'refunds', name: '退款量', area: true, curve: 'smooth' },
    ]}
  />
);

export default Demo;
