import React from 'react';
import { AreaChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', ios: 820, android: 1100, web: 460 },
  { month: '2月', ios: 900, android: 1180, web: 520 },
  { month: '3月', ios: 1050, android: 1320, web: 580 },
  { month: '4月', ios: 980, android: 1450, web: 640 },
  { month: '5月', ios: 1180, android: 1520, web: 700 },
  { month: '6月', ios: 1260, android: 1610, web: 760 },
];

const Demo: React.FC = () => (
  <AreaChart
    data={data}
    xKey="month"
    height={300}
    stack
    series={[
      { key: 'ios', name: 'iOS' },
      { key: 'android', name: 'Android' },
      { key: 'web', name: 'Web' },
    ]}
  />
);

export default Demo;
