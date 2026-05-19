import React, { useState } from 'react';
import { Select, Space } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange' },
  { label: '草莓', value: 'strawberry' },
  { label: '葡萄', value: 'grape' },
];

const Demo: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <Select style={{ maxWidth: 400 }} options={options} value={value} onChange={(v) => setValue(v as string)} searchable clearable placeholder="搜索并选择" />
  );
};

export default Demo;
