import React, { useState } from 'react';
import { Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');

  return (
    <Menu defaultSelectedKey="a">
      <Menu.Group title="基础功能">
        <Menu.Item itemKey="a">仪表盘</Menu.Item>
        <Menu.Item itemKey="b">数据管理</Menu.Item>
      </Menu.Group>
      <Menu.Group title="系统管理">
        <Menu.Item itemKey="c">用户管理</Menu.Item>
        <Menu.Item itemKey="d">权限设置</Menu.Item>
      </Menu.Group>
    </Menu>
  );
};

export default Demo;
