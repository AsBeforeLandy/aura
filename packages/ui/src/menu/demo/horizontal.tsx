import React from 'react';
import { Menu } from '@aura/ui';

const Demo: React.FC = () => (
  <Menu mode="horizontal" defaultSelectedKey="home">
    <Menu.Item itemKey="home">首页</Menu.Item>
    <Menu.Item itemKey="about">关于</Menu.Item>
    <Menu.SubMenu subKey="products" title="产品">
      <Menu.Item itemKey="product-a">产品 A</Menu.Item>
      <Menu.Item itemKey="product-b">产品 B</Menu.Item>
    </Menu.SubMenu>
    <Menu.Item itemKey="contact">联系我们</Menu.Item>
  </Menu>
);

export default Demo;
