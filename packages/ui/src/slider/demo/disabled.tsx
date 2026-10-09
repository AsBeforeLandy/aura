import React, { useState } from 'react';
import { Slider } from '@aura-react-comp/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(30);

  return (
  <Slider value={50} disabled />
);
};

export default Demo;
