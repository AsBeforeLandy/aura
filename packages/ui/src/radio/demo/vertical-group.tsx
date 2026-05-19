import React, { useState } from 'react';
import { RadioGroup } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState('a');

  return (
  <RadioGroup
    options={[
      { label: '选项 A', value: 'a' },
      { label: '选项 B', value: 'b' },
      { label: '选项 C', value: 'c' },
    ]}
    defaultValue="a"
    direction="vertical"
  />
);
};

export default Demo;
