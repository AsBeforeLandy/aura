import React, { useState } from 'react';
import { Steps } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);

  return (
    <Steps current={1} variant="navigation">
      <Steps.Step title="选择商品" />
      <Steps.Step title="确认订单" />
      <Steps.Step title="支付" />
      <Steps.Step title="完成" />
    </Steps>
  );
};

export default Demo;
