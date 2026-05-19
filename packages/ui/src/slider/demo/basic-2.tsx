import React, { useState } from 'react';
import { Slider, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(30);

  return (
    <Space direction="vertical" size="sm">
      <Slider value={value} onChange={(v) => setValue(v as number)} />
      <Text>当前值: {value}</Text>
    </Space>
  );
};

export default Demo;
