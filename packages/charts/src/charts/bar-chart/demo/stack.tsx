import React from 'react';
import { BarChart } from '@aura-react-comp/charts';

const data = [
  { region: '华东', online: 4200, offline: 2600, other: 800 },
  { region: '华南', online: 3600, offline: 2100, other: 620 },
  { region: '华北', online: 3100, offline: 2400, other: 540 },
  { region: '西南', online: 2200, offline: 1500, other: 380 },
  { region: '东北', online: 1600, offline: 1200, other: 300 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        堆叠：看总量与构成
      </div>
      <BarChart
        data={data}
        xKey="region"
        height={240}
        stack
        series={[
          { key: 'online', name: '线上' },
          { key: 'offline', name: '门店' },
          { key: 'other', name: '其他' },
        ]}
      />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        分组：看分类之间的直接比较
      </div>
      <BarChart
        data={data}
        xKey="region"
        height={240}
        series={[
          { key: 'online', name: '线上' },
          { key: 'offline', name: '门店' },
        ]}
      />
    </div>
  </div>
);

export default Demo;
