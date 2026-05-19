import React, { useState } from 'react';
import { Select, Space } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange' },
];

const Demo: React.FC = () => {
  const [value, setValue] = useState('');

  return (
  <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
    <Select options={options} size="sm" placeholder="小号" />
    <Select options={options} size="md" placeholder="中号" />
    <Select options={options} size="lg" placeholder="大号" />
  </Space>
);
};

export default Demo;
