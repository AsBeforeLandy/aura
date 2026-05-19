import React, { useState } from 'react';
import { Rate } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(3);

  return (
  <Rate disabled value={4} />
);
};

export default Demo;
