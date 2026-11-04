import React from 'react';
import { ScatterChart } from '@aura-react-comp/charts';

const sameX = [
  { x: 5, y: 20 },
  { x: 5, y: 60 },
  { x: 5, y: 40 },
];

const single = [{ x: 42, y: 42 }];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        x 值全相同：值域自动扩边，不会把点压在轴线上
      </div>
      <ScatterChart
        data={sameX}
        xKey="x"
        height={180}
        series={[{ key: 'y', name: '观测' }]}
      />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        单点数据
      </div>
      <ScatterChart
        data={single}
        xKey="x"
        height={180}
        series={[{ key: 'y', name: '观测' }]}
      />
    </div>
  </div>
);

export default Demo;
