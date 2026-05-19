import React, { useState } from 'react';
import { Slider, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState([20, 60] as [number, number]);

  return (
    <Space direction="vertical" size="sm">
      <Slider range value={value} onChange={(v) => setValue(v as [number, number])} />
      <Text>当前范围: {value[0]} - {value[1]}</Text>
    </Space>
  );
};

export default Demo;
