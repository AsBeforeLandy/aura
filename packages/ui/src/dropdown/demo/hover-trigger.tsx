import React from 'react';
import { Dropdown, Button } from '@aura/ui';

const menuItems = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'paste', label: '粘贴' },
];

const Demo: React.FC = () => (
  <Dropdown menu={menuItems} trigger="hover">
    <Button>悬停打开</Button>
  </Dropdown>
);

export default Demo;
