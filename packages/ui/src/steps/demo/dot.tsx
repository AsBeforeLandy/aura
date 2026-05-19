import React, { useState } from 'react';
import { Steps } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);

  return (
    <Steps current={1} variant="dot">
      <Steps.Step title="提交申请" description="填写并提交表单" />
      <Steps.Step title="审核中" description="等待审核通过" />
      <Steps.Step title="审核通过" description="申请已通过" />
    </Steps>
  );
};

export default Demo;
