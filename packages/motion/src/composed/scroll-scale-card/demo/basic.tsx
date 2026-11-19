import React from 'react';
import { ScrollScaleCard } from '@aura-react-comp/motion';

const cards = [
  {
    title: '令牌驱动',
    desc: '时长与缓动来自动效令牌，一处调整全局一致',
    // 渐变直接用令牌组：随全局双轴主题联动（primary-700 → 800 同色系深一档）
    bg: 'linear-gradient(135deg, var(--aura-primary-700, #7c3aed), var(--aura-primary-800, #6d28d9))',
  },
  {
    title: '合成器友好',
    desc: '只动画 transform 与 opacity，不触发布局',
    bg: 'linear-gradient(135deg, #0891b2, rgba(8, 145, 178, 0.73))',
  },
  {
    title: '渐进增强',
    desc: 'reduced-motion 下静态呈现，功能零损失',
    bg: 'linear-gradient(135deg, #1d4ed8, rgba(29, 78, 216, 0.73))',
  },
];

/** 向下滚动：每张卡片从 0.9 缩放到 1 并淡入 */
export default () => (
  <div
    style={{
      height: 520,
      overflowY: 'auto',
      border: '1px solid #e8e6de',
      borderRadius: 12,
    }}
  >
    <div
      style={{
        height: 120,
        display: 'grid',
        placeItems: 'center',
        color: '#5f5e5a',
        fontSize: 13,
      }}
    >
      ↓ 向下滚动查看卡片揭示
    </div>
    <div style={{ display: 'grid', gap: 140, padding: '0 24px 200px' }}>
      {cards.map((c) => (
        <ScrollScaleCard key={c.title}>
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: c.bg,
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
              {c.title}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{c.desc}</div>
          </div>
        </ScrollScaleCard>
      ))}
    </div>
  </div>
);
