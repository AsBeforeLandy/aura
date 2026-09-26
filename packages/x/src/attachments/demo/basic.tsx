import React, { useEffect, useState } from 'react';
import { Attachments } from '@aura/x';
import type { AttachmentItem } from '@aura/x';

const INITIAL_ITEMS: AttachmentItem[] = [
  { id: 1, name: '需求文档.pdf', size: 1024 * 1024 * 2.4, status: 'done', description: 'PRD v2.3' },
  { id: 2, name: '首页设计稿.png', size: 1024 * 780, status: 'uploading', percent: 35 },
  { id: 3, name: '接口规范.yaml', size: 1024 * 12, status: 'error', errorTip: '超过单文件限制' },
];

export default () => {
  const [items, setItems] = useState<AttachmentItem[]>(INITIAL_ITEMS);
  const [overflow, setOverflow] = useState<'wrap' | 'scrollX'>('wrap');

  // 模拟上传进度
  useEffect(() => {
    const timer = window.setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.status !== 'uploading' || item.percent === undefined) {
            return item;
          }
          const next = Math.min(100, item.percent + 15);
          return next >= 100
            ? { ...item, status: 'done', percent: 100 }
            : { ...item, percent: next };
        }),
      );
    }, 400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--aura-text-secondary)' }}>
        <input
          type="checkbox"
          checked={overflow === 'scrollX'}
          onChange={(event) => setOverflow(event.target.checked ? 'scrollX' : 'wrap')}
        />
        scrollX 单行横滑
      </label>
      <Attachments
        items={items}
        overflow={overflow}
        onRemove={(item) =>
          setItems((prev) => prev.filter((current) => current.id !== item.id))
        }
      />
      {items.length === 0 ? <p style={{ fontSize: 13, color: 'var(--aura-text-secondary)' }}>暂无附件</p> : null}
    </div>
  );
};
