import React, { useState } from 'react';
import { Bubble, Sender, XProvider } from '@aura/x';

const COLORS = [
  { label: '紫罗兰（默认）', value: '#7c3aed' },
  { label: '海洋蓝', value: '#2563eb' },
  { label: '翡翠绿', value: '#059669' },
  { label: '珊瑚橙', value: '#ea580c' },
];

/** 一段静态示例对话（聚焦展示 colorPrimary 的即时生效） */
const PREVIEW: { key: string; role: 'user' | 'assistant'; content: string }[] = [
  { key: 'u1', role: 'user', content: '帮我总结一下今天的安排' },
  { key: 'a1', role: 'assistant', content: '今天有三件事：\n1. 组件库评审\n2. 文档站部署\n3. 周报提交' },
];

export default () => {
  const [color, setColor] = useState(COLORS[0].value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              border: `1px solid ${color === c.value ? c.value : 'var(--aura-x-bubble-border)'}`,
              borderRadius: 999,
              background: color === c.value ? 'var(--aura-x-accent-soft)' : 'transparent',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.value }} />
            {c.label}
          </button>
        ))}
      </div>
      <XProvider colorPrimary={color}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12, border: '1px solid var(--aura-x-bubble-border)', borderRadius: 12 }}>
          {PREVIEW.map((m) => (
            <Bubble key={m.key} role={m.role} content={m.content} />
          ))}
          <Sender placeholder="主题色即时生效" onSubmit={() => {}} />
        </div>
      </XProvider>
    </div>
  );
};
