import React, { useState } from 'react';
import { Textarea, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('');

  return (
  <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
    <Textarea placeholder="请输入内容" />
    <Textarea placeholder="禁用状态" disabled value="不可编辑" />
  </Space>
);
};

export default Demo;
