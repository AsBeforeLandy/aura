import React, { useState } from 'react';
import { Select, Space } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange' },
  { label: '草莓', value: 'strawberry' },
  { label: '葡萄', value: 'grape', disabled: true },
];

const Demo: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
      <Select options={options} value={value} onChange={(v) => setValue(v as string)} placeholder="请选择水果" />
      <Select options={options} disabled placeholder="禁用状态" />
      <Select options={options} loading placeholder="加载中" />
    </Space>
  );
};

export default Demo;
