import React, { useState } from 'react';
import { Menu, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');

  return (
    <Space direction="vertical" size="sm">
      <Menu selectedKey={selected} onSelect={setSelected}>
        <Menu.Item itemKey="home">首页</Menu.Item>
        <Menu.Item itemKey="profile">个人中心</Menu.Item>
        <Menu.Item itemKey="settings">设置</Menu.Item>
      </Menu>
      <Text>当前选中：{selected}</Text>
    </Space>
  );
};

export default Demo;
