import React, { useState } from 'react';
import { RadioGroup, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('apple');

  return (
    <Space direction="vertical" size="sm">
      <RadioGroup
        options={[
          { label: '苹果', value: 'apple' },
          { label: '香蕉', value: 'banana' },
          { label: '橘子', value: 'orange' },
          { label: '草莓', value: 'strawberry', disabled: true },
        ]}
        value={value}
        onChange={(v) => setValue(v as string)}
        direction="horizontal"
      />
      <Text>当前选中：{value}</Text>
    </Space>
  );
};

export default Demo;
