import React, { useState } from 'react';
import { CheckboxGroup } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState<Array<string | number>>(['apple']);

  return (
    <CheckboxGroup
      options={[
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橘子', value: 'orange' },
        { label: '草莓', value: 'strawberry', disabled: true },
      ]}
      value={value}
      onChange={(v) => setValue(v as Array<string | number>)}
      direction="horizontal"
    />
  );
};

export default Demo;
