import React from 'react';
import { Steps, Flex } from '@aura-react-comp/ui';

const Demo: React.FC = () => (
  <Flex justify="around">
    <Steps current={1} variant="default">
      <Steps.Step title="已完成" description="这是描述" />
      <Steps.Step title="进行中" description="这是描述" />
      <Steps.Step title="待处理" description="这是描述" />
    </Steps>
    <Steps current={1} variant="dot">
      <Steps.Step title="已完成" />
      <Steps.Step title="进行中" />
      <Steps.Step title="待处理" />
    </Steps>
    <Steps
      current={1}
      variant="navigation"
      direction="vertical"
      style={{ maxHeight: 200 }}
    >
      <Steps.Step title="第一步" description="描述信息" />
      <Steps.Step title="第二步" description="描述信息" />
      <Steps.Step title="第三步" description="描述信息" />
    </Steps>
  </Flex>
);

export default Demo;
