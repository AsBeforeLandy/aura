import React from 'react';
import { Sources } from '@aura-react-comp/x';
import type { SourcesItem } from '@aura-react-comp/x';

const ITEMS: SourcesItem[] = [
  {
    key: 'a',
    title: 'Ant Design X — Sources',
    url: 'https://x.ant.design/components/sources-cn',
    description: '行内模式的交互参考：悬停展示来源信息',
  },
  {
    key: 'b',
    title: 'Ant Design X — ThoughtChain',
    url: 'https://x.ant.design/components/thought-chain-cn',
    description: '多步骤推理链路的展示形态',
  },
];

const textStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--aura-font-size-md)',
  lineHeight: 1.8,
  color: 'var(--aura-text)',
};

export default () => (
  <div style={{ maxWidth: 560 }}>
    <p style={textStyle}>
      本轮回答引用了 antdx 的两个组件文档
      <Sources inline items={ITEMS} />
      ，悬停或聚焦序号可以看到来源详情。
    </p>
  </div>
);
