import React, { useState } from 'react';
import { Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');

  return (
    <Menu mode="horizontal" defaultSelectedKey="nav1">
      <Menu.Item itemKey="nav1">导航一</Menu.Item>
      <Menu.Item itemKey="nav2">导航二</Menu.Item>
      <Menu.Item itemKey="nav3">导航三</Menu.Item>
    </Menu>
  );
};

export default Demo;
