import React, { useState } from 'react';
import { Slider } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(20);

  return (
  <Slider
    value={value}
    onChange={(v) => setValue(v as number)}
    step={10}
    marks={{
      0: '0',
      50: '50',
      100: '100',
    }}
  />
);
};

export default Demo;
