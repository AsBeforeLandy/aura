import React from 'react';
import { LineChart } from '@aura-react-comp/charts';
import type { CurveType } from '@aura-react-comp/charts';

const data = [
  { x: '1', v: 12 },
  { x: '2', v: 48 },
  { x: '3', v: 22 },
  { x: '4', v: 76 },
  { x: '5', v: 34 },
];

const curves: { type: CurveType; label: string; desc: string }[] = [
  { type: 'linear', label: 'linear', desc: '直线连接，最忠实于数据' },
  { type: 'monotone', label: 'monotone（默认）', desc: '平滑但不越出数据范围' },
  { type: 'smooth', label: 'smooth', desc: '更圆润，可能轻微越界' },
  { type: 'step', label: 'step', desc: '阶梯状，适合离散状态' },
];

const Demo: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 12,
    }}
  >
    {curves.map((curve) => (
      <div
        key={curve.type}
        style={{
          border: '1px solid var(--aura-border, #e5e7eb)',
          borderRadius: 10,
          padding: 8,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, padding: '0 4px 4px' }}>
          {curve.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--aura-text-secondary, #6b7280)',
            padding: '0 4px 4px',
          }}
        >
          {curve.desc}
        </div>
        <LineChart
          data={data}
          xKey="x"
          height={160}
          legend={false}
          grid={false}
          curve={curve.type}
          series={[{ key: 'v', name: '数值' }]}
        />
      </div>
    ))}
  </div>
);

export default Demo;
