import React from 'react';
import { GraphChart } from '@aura-react-comp/charts';

/** 一组微服务依赖关系，按层分组配色 */
const nodes = [
  { id: 'gateway', name: '网关', group: '接入层' },
  { id: 'web', name: 'Web', group: '接入层' },
  { id: 'app', name: 'App', group: '接入层' },
  { id: 'user', name: '用户服务', group: '业务层' },
  { id: 'order', name: '订单服务', group: '业务层' },
  { id: 'product', name: '商品服务', group: '业务层' },
  { id: 'pay', name: '支付服务', group: '业务层' },
  { id: 'notify', name: '消息服务', group: '基础层' },
  { id: 'db', name: '数据库', group: '基础层' },
  { id: 'cache', name: '缓存', group: '基础层' },
];

const links = [
  { source: 'web', target: 'gateway' },
  { source: 'app', target: 'gateway' },
  { source: 'gateway', target: 'user' },
  { source: 'gateway', target: 'order' },
  { source: 'gateway', target: 'product' },
  { source: 'order', target: 'pay' },
  { source: 'order', target: 'product' },
  { source: 'order', target: 'notify' },
  { source: 'user', target: 'db' },
  { source: 'order', target: 'db' },
  { source: 'product', target: 'db' },
  { source: 'product', target: 'cache' },
  { source: 'user', target: 'cache' },
  { source: 'pay', target: 'notify' },
];

const Demo: React.FC = () => (
  <GraphChart nodes={nodes} links={links} height={400} />
);

export default Demo;
