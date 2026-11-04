import React from 'react';
import { GaugeChart } from '@aura-react-comp/charts';

const Demo: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 8,
    }}
  >
    <GaugeChart
      value={320}
      min={0}
      max={1000}
      unit=" 单"
      label="当日产能"
      ranges={[
        { to: 400, color: '#ef4444' },
        { to: 700, color: '#f59e0b' },
        { to: 1000, color: '#10b981' },
      ]}
      height={220}
    />
    <GaugeChart
      value={86}
      min={0}
      max={100}
      unit=" 分"
      label="服务评分"
      thickness={0.2}
      height={220}
    />
  </div>
);

export default Demo;
