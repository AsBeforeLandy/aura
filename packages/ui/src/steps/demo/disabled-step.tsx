import React, { useState } from 'react';
import { Steps } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);

  return (
    <Steps current={0}>
      <Steps.Step title="步骤一" />
      <Steps.Step title="步骤二" disabled />
      <Steps.Step title="步骤三" />
    </Steps>
  );
};

export default Demo;
