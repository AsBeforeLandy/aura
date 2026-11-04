import React from 'react';
import { SankeyChart } from '@aura-react-comp/charts';

const nodes = [
  { name: '搜索引擎' },
  { name: '社交媒体' },
  { name: '直接访问' },
  { name: '落地页' },
  { name: '商品页' },
  { name: '购物车' },
  { name: '支付成功' },
  { name: '流失' },
];

const links = [
  { source: '搜索引擎', target: '落地页', value: 4200 },
  { source: '搜索引擎', target: '商品页', value: 1800 },
  { source: '社交媒体', target: '落地页', value: 2600 },
  { source: '社交媒体', target: '商品页', value: 1400 },
  { source: '直接访问', target: '商品页', value: 2100 },
  { source: '落地页', target: '商品页', value: 5200 },
  { source: '落地页', target: '流失', value: 1600 },
  { source: '商品页', target: '购物车', value: 6400 },
  { source: '商品页', target: '流失', value: 4100 },
  { source: '购物车', target: '支付成功', value: 3800 },
  { source: '购物车', target: '流失', value: 2600 },
];

const Demo: React.FC = () => (
  <SankeyChart nodes={nodes} links={links} height={400} />
);

export default Demo;
