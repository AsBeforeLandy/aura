import React from 'react';
import { Input, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Input.Password variant="default" placeholder="Default 变体" />
    <Input.Password variant="filled" placeholder="Filled 变体" />
    <Input.Password variant="bordered" placeholder="Bordered 变体" />
  </Space>
);

export default Demo;
