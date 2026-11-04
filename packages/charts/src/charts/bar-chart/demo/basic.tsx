import React from 'react';
import { BarChart } from '@aura-react-comp/charts';

const data = [
  { region: '华东', online: 4200, offline: 2600 },
  { region: '华南', online: 3600, offline: 2100 },
  { region: '华北', online: 3100, offline: 2400 },
  { region: '西南', online: 2200, offline: 1500 },
  { region: '东北', online: 1600, offline: 1200 },
];

const Demo: React.FC = () => (
  <BarChart
    data={data}
    xKey="region"
    height={300}
    series={[
      { key: 'online', name: '线上' },
      { key: 'offline', name: '门店' },
    ]}
  />
);

export default Demo;
