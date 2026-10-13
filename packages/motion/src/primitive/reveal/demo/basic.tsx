import React from 'react';
import { Reveal } from '@aura-react-comp/motion';

const features = [
  { title: '令牌驱动', desc: '时长、缓动、位移全部来自 --aura-motion-* 令牌' },
  { title: '合成器友好', desc: '只动画 transform 与 opacity，不触发布局' },
  { title: '三层降级', desc: 'prefers-reduced-motion 下逐层归零，功能不受影响' },
  { title: '可测', desc: 'data-motion-state 意图状态机，vitest 可确定性断言' },
];

/** 向下滚动查看依次揭示 */
export default () => (
  <div style={{ display: 'grid', gap: 16 }}>
    {features.map((f, i) => (
      <Reveal key={f.title} index={i}>
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 12,
            border: '1px solid #d3d1c7',
            background: '#faf9f5',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{f.title}</div>
          <div style={{ color: '#5f5e5a', fontSize: 13 }}>{f.desc}</div>
        </div>
      </Reveal>
    ))}
  </div>
);
