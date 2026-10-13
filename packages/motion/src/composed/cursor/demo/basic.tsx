import React from 'react';
import { Button, Space } from 'antd';
import { Cursor } from '@aura-react-comp/motion';

/** 移动鼠标：点快速跟随、环慢速追随；悬停按钮时环放大 */
export default () => (
  <Space direction="vertical" size={16} style={{ width: '100%' }}>
    <Cursor variant="dot-ring" />
    <Space wrap>
      <Button data-cursor size="large">
        data-cursor 元素（环放大）
      </Button>
      <Button data-cursor type="primary" size="large">
        同样放大
      </Button>
      <Button size="large">普通元素（无反应）</Button>
    </Space>
    <div style={{ color: '#5f5e5a', fontSize: 12 }}>
      触屏设备与开启"减弱动态效果"的用户不会看到此组件。
    </div>
  </Space>
);
