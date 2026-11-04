import React from 'react';
import { TreemapChart } from '@aura-react-comp/charts';
import type { HierarchyNode } from '@aura-react-comp/charts';

const data: HierarchyNode = {
  name: '销售',
  children: [
    {
      name: '华东',
      children: [
        { name: '上海', value: 320 },
        { name: '杭州', value: 260 },
        { name: '南京', value: 150 },
      ],
    },
    {
      name: '华南',
      children: [
        { name: '深圳', value: 280 },
        { name: '广州', value: 210 },
      ],
    },
    {
      name: '华北',
      children: [
        { name: '北京', value: 300 },
        { name: '天津', value: 90 },
      ],
    },
    { name: '西南', value: 120 },
  ],
};

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        展开两层：父块包着子块，颜色同族
      </div>
      <TreemapChart data={data} height={300} maxDepth={2} />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        只画一层 + 关闭数值：标签更大更清爽
      </div>
      <TreemapChart
        data={data}
        height={200}
        maxDepth={1}
        showValue={false}
        gap={4}
      />
    </div>
  </div>
);

export default Demo;
