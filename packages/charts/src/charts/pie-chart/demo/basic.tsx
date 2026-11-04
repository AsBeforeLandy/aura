import React from 'react';
import { PieChart } from '@aura-react-comp/charts';

const data = [
  { name: '直接访问', value: 3350 },
  { name: '搜索引擎', value: 2580 },
  { name: '社交媒体', value: 1540 },
  { name: '邮件营销', value: 860 },
  { name: '联盟广告', value: 420 },
];

const Demo: React.FC = () => (
  <PieChart data={data} height={340} innerRadius={0} label="outside" />
);

export default Demo;
