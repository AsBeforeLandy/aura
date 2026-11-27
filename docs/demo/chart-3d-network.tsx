import React, { useState } from 'react';
import {
  Network3D,
  Scene3D,
  type Network3DNode,
} from '@aura-react-comp/charts-3d';

const nodes: Network3DNode[] = [
  { id: 'web', label: 'Web 应用', category: '接入层', value: 100 },
  { id: 'gateway', label: 'API 网关', category: '接入层', value: 90 },
  { id: 'auth', label: '认证服务', category: '基础服务', value: 70 },
  { id: 'order', label: '订单服务', category: '业务服务', value: 95 },
  { id: 'payment', label: '支付服务', category: '业务服务', value: 85 },
  { id: 'inventory', label: '库存服务', category: '业务服务', value: 75 },
  { id: 'user', label: '用户服务', category: '业务服务', value: 80 },
  { id: 'mysql', label: 'MySQL', category: '数据层', value: 90 },
  { id: 'redis', label: 'Redis', category: '数据层', value: 65 },
  { id: 'mq', label: '消息队列', category: '数据层', value: 60 },
  { id: 'search', label: '搜索服务', category: '基础服务', value: 55 },
  { id: 'analytics', label: '数据分析', category: '基础服务', value: 45 },
];

const links = [
  { source: 'web', target: 'gateway', value: 100 },
  { source: 'gateway', target: 'auth', value: 80 },
  { source: 'gateway', target: 'order', value: 95 },
  { source: 'order', target: 'payment', value: 85 },
  { source: 'order', target: 'inventory', value: 75 },
  { source: 'order', target: 'user', value: 80 },
  { source: 'order', target: 'mysql', value: 90 },
  { source: 'payment', target: 'mysql', value: 70 },
  { source: 'inventory', target: 'mysql', value: 65 },
  { source: 'gateway', target: 'redis', value: 60 },
  { source: 'auth', target: 'redis', value: 55 },
  { source: 'order', target: 'mq', value: 60 },
  { source: 'inventory', target: 'mq', value: 50 },
  { source: 'mq', target: 'analytics', value: 45 },
  { source: 'mysql', target: 'analytics', value: 40 },
  { source: 'user', target: 'search', value: 55 },
];

/** 服务依赖拓扑：力导布局、邻居高亮与节点点击。 */
export default () => {
  const [selected, setSelected] = useState<Network3DNode | null>(null);

  return (
    <div>
      <Scene3D height={460} cameraPosition={[300, 240, 340]}>
        <Network3D
          nodes={nodes}
          links={links}
          layout="force"
          seed={7}
          showLabels
          onNodeClick={setSelected}
        />
      </Scene3D>
      <p
        role="status"
        style={{ marginTop: 'var(--aura-spacing-3)', marginBottom: 0 }}
      >
        {selected
          ? `已选择：${selected.label ?? selected.id}（${selected.category ?? '未分类'}）`
          : '悬停查看节点详情，点击选择节点'}
      </p>
    </div>
  );
};
