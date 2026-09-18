import React, { useState } from 'react';
import { Avatar } from '@aura/ui';
import { Actions, Bubble } from '@aura/x';

export default () => {
  const [copied, setCopied] = useState(false);

  return (
    <Bubble
      role="assistant"
      content="这是带完整插槽的气泡：header 显示来源，footer 放操作组。点击「复制」试试。"
      avatar={<Avatar size={36}>A</Avatar>}
      header={<span>助手 · 引用 2 篇文档</span>}
      footer={
        <Actions
          ariaLabel="消息操作"
          items={[
            {
              key: 'copy',
              label: copied ? '已复制' : '复制',
              onClick: () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              },
            },
            { key: 'regen', label: '重新生成', onClick: () => {} },
            { key: 'like', label: '点赞', onClick: () => {} },
          ]}
        />
      }
    />
  );
};
