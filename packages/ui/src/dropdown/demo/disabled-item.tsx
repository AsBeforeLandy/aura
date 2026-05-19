import React from 'react';
import { Dropdown, Button } from '@aura/ui';

const menuItems = [
  { key: 'undo', label: '撤销' },
  { key: 'redo', label: '重做' },
  { key: 'cut', label: '剪切', disabled: true },
  { key: 'delete', label: '删除', danger: true },
];

const Demo: React.FC = () => (
  <Dropdown menu={menuItems}>
    <Button>包含禁用项</Button>
  </Dropdown>
);

export default Demo;
