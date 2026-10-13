import React from 'react';
import { Button, Input, Space } from 'antd';
import { FocusRing } from '@aura-react-comp/motion';

/** 用 Tab 键在元素间移动，观察焦点环的跟随动画（鼠标点击也算聚焦） */
export default () => (
  <Space direction="vertical" size={16} style={{ width: '100%' }}>
    <FocusRing radius={8}>
      <Space wrap>
        <Button>搜索</Button>
        <Button type="primary">新建</Button>
        <Button>导出</Button>
      </Space>
    </FocusRing>
    <FocusRing radius={10} style={{ maxWidth: 320 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input placeholder="用户名（Tab 到这里）" />
        <Input.Password placeholder="密码" />
      </Space>
    </FocusRing>
    <div style={{ color: '#5f5e5a', fontSize: 12 }}>
      提示：连续按 Tab 键，焦点环会以弹簧动画在元素间移动。
    </div>
  </Space>
);
