import React, { useState } from 'react';
import { Select, Space } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana', disabled: true },
  { label: '橘子', value: 'orange' },
];

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
    <Select options={options} placeholder="香蕉被禁选" />
    <Select options={options} disabled placeholder="整体禁用" />
  </Space>
);

export default Demo;
