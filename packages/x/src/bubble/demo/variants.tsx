import React from 'react';
import { Bubble } from '@aura/x';

const CELLS = [
  { role: 'assistant' as const, variant: 'filled' as const, label: 'AI · filled' },
  { role: 'user' as const, variant: 'filled' as const, label: '用户 · filled' },
  { role: 'assistant' as const, variant: 'outlined' as const, label: 'AI · outlined' },
  { role: 'user' as const, variant: 'outlined' as const, label: '用户 · outlined' },
  { role: 'assistant' as const, variant: 'shadow' as const, label: 'AI · shadow' },
  { role: 'user' as const, variant: 'shadow' as const, label: '用户 · shadow' },
];

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
    {CELLS.map((cell) => (
      <div key={cell.label}>
        <div style={{ fontSize: 12, color: 'var(--aura-text-tertiary)', marginBottom: 4 }}>
          {cell.label}
        </div>
        <Bubble role={cell.role} variant={cell.variant} content={`这是「${cell.label}」的消息内容示例。`} />
      </div>
    ))}
  </div>
);
