import React, { useState } from 'react';
import { Select } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange' },
];

const Demo: React.FC = () => {
  const [value, setValue] = useState('apple');
  return (
    <Select
      style={{ maxWidth: 400 }}
      options={options}
      value={value}
      onChange={(v) => setValue(v as string)}
      clearable
      placeholder="选择后可清除"
    />
  );
};

export default Demo;
