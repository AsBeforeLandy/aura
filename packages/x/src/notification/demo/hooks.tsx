import React from 'react';
import { useNotification } from '@aura/x';

export default () => {
  const [{ permission }, { open, close, requestPermission }] = useNotification();

  const handleOpen = async () => {
    if (permission !== 'granted') {
      await requestPermission();
      return;
    }
    open({
      title: '报告已生成',
      body: '3 个来源、12 个段落，点击查看完整报告。',
      tag: 'report',
      duration: 6000,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--aura-font-size-sm)',
          color: 'var(--aura-text-secondary)',
        }}
      >
        当前权限：<code>{permission}</code>
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(
          [
            ['申请权限并推送', handleOpen],
            [
              '关闭 tag=report',
              () => close(['report']),
            ],
            ['关闭全部', () => close()],
          ] as const
        ).map(([label, handler]) => (
          <button
            key={label}
            type="button"
            onClick={handler}
            style={{
              padding: '6px 14px',
              border: '1px solid var(--aura-border)',
              borderRadius: 'var(--aura-radius-sm)',
              background: 'transparent',
              color: 'var(--aura-text)',
              fontSize: 'var(--aura-font-size-sm)',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
