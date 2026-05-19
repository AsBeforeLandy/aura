import React, { useState } from 'react';
import { Select, Space } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange' },
];

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
    <Select options={options} placeholder="默认样式 (default)" />
    <Select options={options} variant="filled" placeholder="填充样式 (filled)" />
    <Select options={options} variant="bordered" placeholder="加粗边框 (bordered)" />
  </Space>
);

export default Demo;
