import React, { useState } from 'react';
import { Sources } from '@aura-react-comp/x';
import type { SourcesItem } from '@aura-react-comp/x';

const ITEMS: SourcesItem[] = [
  {
    key: 'antdx',
    title: 'Ant Design X 组件总览',
    url: 'https://x.ant.design/components/overview-cn',
    description: '官方组件全集的权威出处',
  },
  {
    key: 'tokens',
    title: 'Aura 主题令牌定义',
    url: 'https://github.com/AsBeforeLandy/aura',
    description: 'packages/ui/src/theme/tokens.css',
  },
  {
    key: 'internal',
    title: '内部评审记录（无外链）',
    description: '仅展示、不可跳转，用于演示无 url 的渲染分支',
  },
];

export default () => {
  const [clicked, setClicked] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      <Sources items={ITEMS} onClick={(item) => setClicked(String(item.title))} />
      <Sources items={ITEMS.slice(0, 2)} title="默认折叠" defaultExpanded={false} />
      {clicked ? (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--aura-font-size-xs)',
            color: 'var(--aura-text-secondary)',
          }}
        >
          最近点击：{clicked}
        </p>
      ) : null}
    </div>
  );
};
