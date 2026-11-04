import React from 'react';
import { ScatterChart } from '@aura-react-comp/charts';

const dataA = [
  { x: 12, y: 34 },
  { x: 22, y: 48 },
  { x: 31, y: 39 },
  { x: 44, y: 62 },
  { x: 52, y: 55 },
];

const dataB = [
  { x: 14, y: 58 },
  { x: 26, y: 71 },
  { x: 35, y: 66 },
  { x: 47, y: 84 },
  { x: 58, y: 79 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        多系列：不同颜色区分组别
      </div>
      <ScatterChart
        data={dataA.map((row, index) => ({ ...row, b: dataB[index].y }))}
        xKey="x"
        height={220}
        series={[
          { key: 'y', name: '对照组' },
          { key: 'b', name: '实验组' },
        ]}
      />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        方形标记：适合印刷或色觉障碍场景
      </div>
      <ScatterChart
        data={dataA}
        xKey="x"
        height={200}
        symbol="diamond"
        symbolSize={10}
        series={[{ key: 'y', name: '观测值' }]}
      />
    </div>
  </div>
);

export default Demo;
