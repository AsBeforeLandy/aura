import React from 'react';
import { Input, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Input.Search variant="default" placeholder="Default 变体" />
    <Input.Search variant="filled" placeholder="Filled 变体" />
    <Input.Search variant="bordered" placeholder="Bordered 变体" />
  </Space>
);

export default Demo;
