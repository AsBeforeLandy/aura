import React, { useState } from 'react';
import { Rate, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(3);

  return (
    <Space direction="vertical" size="sm">
      <Rate allowClear value={value} onChange={setValue} />
      <Text>再次点击当前值可清零</Text>
    </Space>
  );
};

export default Demo;
