import React, { useState } from 'react';
import { Slider } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(37);

  return (
  <Slider
    value={value}
    onChange={(v) => setValue(v as number)}
    marks={{
      0: '0',
      25: '25%',
      50: '50%',
      75: '75%',
      100: '100%',
    }}
  />
);
};

export default Demo;
