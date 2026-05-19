import React from 'react';
import { Input, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Input.Password size="sm" placeholder="Small 密码" />
    <Input.Password size="md" placeholder="Medium 密码" />
    <Input.Password size="lg" placeholder="Large 密码" />
  </Space>
);

export default Demo;
