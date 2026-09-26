import React, { useState } from 'react';
import { Attachments, Sender } from '@aura/x';
import type { AttachmentItem } from '@aura/x';

const INITIAL: AttachmentItem[] = [
  { id: 1, name: '需求文档.pdf', size: 1024 * 1024 * 2.4, status: 'done' },
  { id: 2, name: '首页设计稿.png', size: 1024 * 780, status: 'uploading', percent: 60 },
];

export default () => {
  const [value, setValue] = useState('');
  const [items, setItems] = useState<AttachmentItem[]>(INITIAL);
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 640,
      }}
    >
      <Sender
        value={value}
        onChange={setValue}
        onSubmit={(content) => {
          const names = items.map((item) => item.name).join('、') || '无';
          setSent((prev) => [...prev, `${content}（附件：${names}）`]);
          setValue('');
          setItems([]);
        }}
        // 附件条放在 header 插槽；列表为空时传 undefined，避免渲染出空的插槽容器
        header={
          items.length > 0 ? (
            <Attachments
              items={items}
              overflow="scrollX"
              onRemove={(item) =>
                setItems((prev) => prev.filter((current) => current.id !== item.id))
              }
            />
          ) : undefined
        }
        footer={
          <span style={{ marginLeft: 'auto' }}>
            {items.length > 0 ? `${items.length} 个附件 · ` : ''}
            {value.length} 字
          </span>
        }
      />
      {sent.map((line, index) => (
        <p
          key={index}
          style={{
            margin: 0,
            fontSize: 'var(--aura-font-size-xs)',
            color: 'var(--aura-text-secondary)',
          }}
        >
          已发送：{line}
        </p>
      ))}
    </div>
  );
};
