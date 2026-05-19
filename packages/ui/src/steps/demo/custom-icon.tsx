import React, { useState } from 'react';
import { Steps } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);

  return (
    <Steps current={1}>
      <Steps.Step title="用户" icon="👤" />
      <Steps.Step title="邮件" icon="📧" />
      <Steps.Step title="完成" icon="✅" />
    </Steps>
  );
};

export default Demo;
