import React, { useState } from 'react';
import { Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');

  return (
    <Menu defaultSelectedKey="home">
      <Menu.Item itemKey="home" icon="🏠">首页</Menu.Item>
      <Menu.Item itemKey="user" icon="👤">个人中心</Menu.Item>
      <Menu.Item itemKey="settings" icon="⚙️">设置</Menu.Item>
    </Menu>
  );
};

export default Demo;
