import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { Confetti } from '@aura-react-comp/motion';

/** 点击按钮发射一轮；fire 计数器驱动 */
export default () => {
  const [fire, setFire] = useState(0);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Confetti fire={fire} count={140} origin={{ x: 0.5, y: 0.45 }} />
      <Button type="primary" size="large" onClick={() => setFire((f) => f + 1)}>
        🎉 发射庆祝粒子
      </Button>
      <div style={{ color: '#5f5e5a', fontSize: 12 }}>
        已发射 {fire} 轮 —— reduced-motion 用户点击无任何效果（设计使然）。
      </div>
    </Space>
  );
};
