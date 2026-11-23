import React from 'react';
import { Input, Space } from '@aura-react-comp/design';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Input.Search size="sm" placeholder="Small 搜索" />
    <Input.Search size="md" placeholder="Medium 搜索" />
    <Input.Search size="lg" placeholder="Large 搜索" />
  </Space>
);

export default Demo;
