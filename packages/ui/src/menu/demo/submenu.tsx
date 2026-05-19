import React, { useState } from 'react';
import { Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');

  return (
    <Menu defaultSelectedKey="a">
      <Menu.SubMenu subKey="sub1" title="子菜单一">
        <Menu.Item itemKey="a">选项 1</Menu.Item>
        <Menu.Item itemKey="b">选项 2</Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu subKey="sub2" title="子菜单二">
        <Menu.Item itemKey="c">选项 3</Menu.Item>
        <Menu.Item itemKey="d">选项 4</Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default Demo;
