import React from 'react';
import { HeatmapChart } from '@aura-react-comp/charts';

const regions = ['华东', '华南', '华北', '西南'];
const categories = ['女装', '数码', '生鲜', '家居', '美妆'];

const data = regions.flatMap((region, regionIndex) =>
  categories.map((category, categoryIndex) => ({
    x: category,
    y: region,
    // 缺一个格子，演示「无数据」的表达
    value:
      regionIndex === 3 && categoryIndex === 1
        ? null
        : 120 +
          regionIndex * 45 +
          categoryIndex * 30 -
          regionIndex * categoryIndex * 12,
  })),
);

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        显示数值 + 自定义色阶（浅蓝 → 深蓝）
      </div>
      <HeatmapChart
        data={data}
        xLabels={categories}
        yLabels={regions}
        height={220}
        showValue
        colorRange={['#e0f2fe', '#0369a1']}
      />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        自动判定是否显示数值（格子太小则不显示，避免文字溢出）
      </div>
      <HeatmapChart
        data={data}
        xLabels={categories}
        yLabels={regions}
        height={180}
        cellGap={2}
      />
    </div>
  </div>
);

export default Demo;
