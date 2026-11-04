import React from 'react';
import { GraphChart } from '@aura-react-comp/charts';

const nodes = [
  { id: 'a', name: '张三', group: '产品' },
  { id: 'b', name: '李四', group: '研发' },
  { id: 'c', name: '王五', group: '研发' },
  { id: 'd', name: '赵六', group: '设计' },
  { id: 'e', name: '钱七', group: '运营' },
];

const links = [
  { source: 'a', target: 'b' },
  { source: 'a', target: 'c' },
  { source: 'a', target: 'd' },
  { source: 'b', target: 'c' },
  { source: 'd', target: 'e' },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        少量节点：标签全显示，半径按连接数放大
      </div>
      <GraphChart nodes={nodes} links={links} height={280} nodeSize={10} />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        关闭标签与按度缩放：只保留结构轮廓
      </div>
      <GraphChart
        nodes={nodes}
        links={links}
        height={200}
        showLabel={false}
        scaleByDegree={false}
        nodeSize={6}
      />
    </div>
  </div>
);

export default Demo;
