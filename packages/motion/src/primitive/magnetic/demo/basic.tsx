import React from 'react';
import { Button, Space } from 'antd';
import { Magnetic } from '@aura-react-comp/motion';

/** 移动鼠标到按钮上感受磁吸；不同 strength 对比 */
export default () => (
  <Space size={24} wrap>
    <Magnetic strength={0.2}>
      <Button type="primary" size="large" shape="round">
        strength 0.2
      </Button>
    </Magnetic>
    <Magnetic strength={0.5}>
      <Button type="primary" size="large" shape="round" danger>
        strength 0.5
      </Button>
    </Magnetic>
    <Magnetic strength={0.9}>
      <Button
        shape="circle"
        size="large"
        style={{ background: '#534ab7', color: '#fff', border: 'none' }}
      >
        0.9
      </Button>
    </Magnetic>
  </Space>
);
