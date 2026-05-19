import React, { useState } from 'react';
import { Rate } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(3);

  return (
  <Rate count={10} value={7} onChange={(v) => setValue(v)} />
);
};

export default Demo;
