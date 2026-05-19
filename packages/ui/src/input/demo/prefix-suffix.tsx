import React, { useState } from 'react';
import { Input, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
      <Input prefix={<Text>https://</Text>} placeholder="example.com" />
      <Input suffix={<Text>.com</Text>} placeholder="example" />
      <Input
        allowClear
        placeholder="输入内容后可清除"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Input status="error" placeholder="错误状态" />
      <Input status="warning" placeholder="警告状态" />
    </Space>
  );
};

export default Demo;
