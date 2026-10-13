import React from 'react';
import { motion } from 'motion/react';
import { InViewport } from '@aura-react-comp/motion';

/** InViewport 包装 + 子元素自定义进场形态（缩放与滑入） */
export default () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <InViewport>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          padding: 20,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0f6e56, #1d9e75)',
          color: '#fff',
          fontWeight: 500,
        }}
      >
        由 InViewport 触发，形态由子元素决定：缩放进场
      </motion.div>
    </InViewport>
    <InViewport offset={32}>
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          padding: 20,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #185fa5, #378add)',
          color: '#fff',
          fontWeight: 500,
        }}
      >
        由 InViewport 触发：从左滑入
      </motion.div>
    </InViewport>
  </div>
);
