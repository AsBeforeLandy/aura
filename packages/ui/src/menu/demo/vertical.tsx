import React, { useState } from 'react';
import { Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');

  return (
    <Menu defaultSelectedKey="home" onSelect={setSelected}>
      <Menu.Item itemKey="home">首页</Menu.Item>
      <Menu.Item itemKey="about">关于</Menu.Item>
      <Menu.Item itemKey="settings">设置</Menu.Item>
      <Menu.Item itemKey="disabled" disabled>
        禁用项
      </Menu.Item>
    </Menu>
  );
};

export default Demo;
