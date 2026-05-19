import React, { useState } from 'react';
import { Rate, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(3);

  return (
    <Space direction="vertical" size="sm">
      <Rate value={value} onChange={setValue} />
      <Text>当前评分: {value}</Text>
    </Space>
  );
};

export default Demo;
