import React, { useState } from 'react';
import { Select, Space } from '@aura/ui';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橘子', value: 'orange' },
];

const Demo: React.FC = () => {
  const [controlled, setControlled] = useState('banana');
  return (
    <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
      <Select
        options={options}
        value={controlled}
        onChange={(v) => setControlled(v as string)}
        placeholder="受控模式"
      />
      <span style={{ fontSize: 12, color: '#888' }}>当前值：{controlled}</span>
      <Select
        options={options}
        defaultValue="apple"
        placeholder="非受控模式（defaultValue）"
      />
    </Space>
  );
};

export default Demo;
