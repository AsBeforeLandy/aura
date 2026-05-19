import React from 'react';
import { Tooltip, Button, Space, Input } from '@aura/ui';

const Demo: React.FC = () => (
  <Space size="md">
    <Tooltip content="鼠标悬停触发" trigger="hover">
      <Button>Hover</Button>
    </Tooltip>
    <Tooltip content="点击触发" trigger="click">
      <Button>Click</Button>
    </Tooltip>
    <Tooltip content="聚焦触发" trigger="focus">
      <Input placeholder="聚焦我" size="sm" />
    </Tooltip>
  </Space>
);

export default Demo;
