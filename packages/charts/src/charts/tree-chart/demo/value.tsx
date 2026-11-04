import React from 'react';
import { TreeChart } from '@aura-react-comp/charts';
import type { HierarchyNode } from '@aura-react-comp/charts';

/** 带数值的树：适合展示目录大小、组织人力、预算拆分 */
const data: HierarchyNode = {
  name: '研发预算',
  children: [
    {
      name: '人力',
      children: [
        { name: '前端', value: 320 },
        { name: '后端', value: 460 },
        { name: '测试', value: 180 },
      ],
    },
    {
      name: '工具',
      children: [
        { name: '云资源', value: 260 },
        { name: 'SaaS 订阅', value: 120 },
      ],
    },
    { name: '培训', value: 90 },
  ],
};

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        显示数值
      </div>
      <TreeChart data={data} height={280} showValue />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        紧凑排布（labelSpace 收窄，叶子标签更贴近节点）
      </div>
      <TreeChart data={data} height={220} labelSpace={64} nodeSize={3} />
    </div>
  </div>
);

export default Demo;
