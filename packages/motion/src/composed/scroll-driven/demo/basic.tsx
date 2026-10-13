import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { ScrollDriven } from '@aura-react-comp/motion';

/** 在 320px 高的滚动容器内体验：进度条填充 + 数字随滚动变化 */
export default () => {
  return (
    <div
      style={{
        height: 320,
        overflowY: 'auto',
        border: '1px solid #d3d1c7',
        borderRadius: 12,
      }}
    >
      <div style={{ padding: 16, position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <ScrollDriven offset={['start start', 'end end']}>
          {(progress) => {
            const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
            return (
              <div>
                <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 6 }}>
                  滚动进度（motion 数值直接驱动 DOM）
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: '#e8e6de',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #534ab7, #7f77dd)',
                      transformOrigin: '0 50%',
                      scaleX: progress,
                    }}
                  />
                </div>
                <motion.span style={{ fontWeight: 600, fontSize: 20 }}>{percent}</motion.span>
              </div>
            );
          }}
        </ScrollDriven>
      </div>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{ padding: 16, borderRadius: 8, background: '#faf9f5', color: '#5f5e5a' }}
          >
            内容块 {i + 1} —— 继续向下滚动
          </div>
        ))}
      </div>
    </div>
  );
};
