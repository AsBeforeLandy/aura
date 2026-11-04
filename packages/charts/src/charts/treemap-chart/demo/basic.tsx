import React from 'react';
import { TreemapChart } from '@aura-react-comp/charts';
import type { HierarchyNode } from '@aura-react-comp/charts';

/** 磁盘占用：两层结构，面积即体积 */
const data: HierarchyNode = {
  name: '磁盘',
  children: [
    {
      name: 'node_modules',
      children: [
        { name: 'react-dom', value: 41 },
        { name: 'typescript', value: 63 },
        { name: 'webpack', value: 38 },
        { name: 'esbuild', value: 22 },
      ],
    },
    {
      name: 'src',
      children: [
        { name: 'components', value: 34 },
        { name: 'pages', value: 18 },
        { name: 'utils', value: 9 },
      ],
    },
    {
      name: 'dist',
      children: [
        { name: 'assets', value: 26 },
        { name: 'static', value: 12 },
      ],
    },
    { name: 'docs', value: 15 },
    { name: 'public', value: 8 },
  ],
};

const Demo: React.FC = () => (
  <TreemapChart data={data} height={340} maxDepth={2} />
);

export default Demo;
