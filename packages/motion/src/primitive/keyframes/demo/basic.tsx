import React from 'react';
import { Space } from 'antd';
import { Keyframes } from '@aura-react-comp/motion';

const dot: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 28,
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  fontWeight: 600,
};

/** 心跳（scale）与警示摇摆（rotate） */
export default () => (
  <Space size={32} wrap>
    <Keyframes animate={{ scale: [1, 1.12, 1] }} duration="normal" repeat={Infinity} repeatDelay={0.4}>
      <div style={{ ...dot, background: '#d4537e' }}>心</div>
    </Keyframes>
    <Keyframes animate={{ rotate: [0, -8, 8, -6, 6, 0] }} duration="slow" repeat={Infinity} repeatDelay={1}>
      <div style={{ ...dot, background: '#ba7517' }}>摆</div>
    </Keyframes>
    <Keyframes animate={{ y: [0, -10, 0], opacity: [1, 0.7, 1] }} duration="slow" ease="standard" repeat={Infinity}>
      <div style={{ ...dot, background: '#185fa5' }}>浮</div>
    </Keyframes>
  </Space>
);
