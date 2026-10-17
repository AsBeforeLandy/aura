import React from 'react';
import { Space } from 'antd';
import { GradientBorder } from '@aura-react-comp/motion';

/** 两种配色与粗细 */
export default () => (
  <Space direction="vertical" size={20} style={{ width: '100%' }}>
    <GradientBorder radius={14} size={1.5}>
      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pro 计划</div>
        <div style={{ color: '#5f5e5a', fontSize: 13 }}>
          解锁全部动效组件与优先支持 —— 光带沿边框缓慢绕行
        </div>
      </div>
    </GradientBorder>
    <GradientBorder radius={14} size={2} colors={['#0f6e56', '#1d9e75']} speed={2.6}>
      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>升级加速（2.6s / 2px）</div>
        <div style={{ color: '#5f5e5a', fontSize: 13 }}>更快的绕行速度与更粗的光带</div>
      </div>
    </GradientBorder>
  </Space>
);
