import React, { useState } from 'react';
import { Steps } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);

  return (
    <Steps current={1} size="sm">
      <Steps.Step title="第一步" />
      <Steps.Step title="第二步" />
      <Steps.Step title="第三步" />
    </Steps>
  );
};

export default Demo;
