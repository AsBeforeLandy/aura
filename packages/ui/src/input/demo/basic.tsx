import React, { useState } from 'react';
import { Input, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('');

  return (
    <Space direction="vertical" size="md" style={{ maxWidth: 400 }}>
      <Input placeholder="请输入内容" />
      <Input placeholder="禁用状态" disabled value="不可编辑" />
    </Space>
  );
};

export default Demo;
