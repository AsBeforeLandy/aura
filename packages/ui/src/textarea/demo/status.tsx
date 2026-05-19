import React, { useState } from 'react';
import { Textarea, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
      <Textarea status="error" placeholder="错误状态" />
      <Textarea status="warning" placeholder="警告状态" />
      <Textarea
        showCount
        maxLength={200}
        placeholder="最多输入 200 个字符"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Space>
  );
};

export default Demo;
