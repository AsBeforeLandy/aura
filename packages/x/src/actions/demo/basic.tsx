import React, { useState } from 'react';
import { Actions } from '@aura/x';

export default () => {
  const [liked, setLiked] = useState(false);
  const [log, setLog] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      <Actions
        ariaLabel="消息操作"
        items={[
          {
            key: 'copy',
            label: '复制',
            onClick: () => setLog('已复制到剪贴板'),
          },
          {
            key: 'regenerate',
            label: '重新生成',
            onClick: () => setLog('正在重新生成…'),
          },
          {
            key: 'like',
            label: liked ? '已点赞' : '点赞',
            active: liked,
            onClick: () => setLiked((v) => !v),
          },
          {
            key: 'del',
            label: '删除',
            danger: true,
            onClick: () => setLog('已删除'),
          },
        ]}
      />
      {log ? (
        <p style={{ fontSize: 13, color: 'var(--aura-text-secondary)' }}>{log}</p>
      ) : null}
    </div>
  );
};
