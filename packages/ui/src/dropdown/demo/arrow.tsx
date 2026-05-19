import React from 'react';
import { Dropdown, Button, Space } from '@aura/ui';

const menu = [
  { key: '1', label: '编辑' },
  { key: '2', label: '复制' },
  { key: '3', label: '删除', danger: true },
];

const Demo: React.FC = () => (
  <Space size="md">
    <Dropdown menu={menu} arrow={false}>
      <Button>无箭头</Button>
    </Dropdown>
    <Dropdown menu={menu} arrow>
      <Button>有箭头</Button>
    </Dropdown>
  </Space>
);

export default Demo;
