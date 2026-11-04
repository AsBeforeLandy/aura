import React from 'react';
import { TreeChart } from '@aura-react-comp/charts';
import type { HierarchyNode } from '@aura-react-comp/charts';

const org: HierarchyNode = {
  name: 'CEO',
  children: [
    {
      name: '技术中心',
      children: [
        {
          name: '前端组',
          children: [
            { name: '组件库' },
            { name: '业务开发' },
            { name: '可视化' },
          ],
        },
        {
          name: '后端组',
          children: [{ name: '基础服务' }, { name: '数据平台' }],
        },
        { name: '测试组' },
      ],
    },
    {
      name: '产品中心',
      children: [{ name: '产品设计' }, { name: '用户研究' }],
    },
    {
      name: '市场中心',
      children: [{ name: '品牌' }, { name: '增长' }],
    },
  ],
};

const Demo: React.FC = () => <TreeChart data={org} height={360} />;

export default Demo;
