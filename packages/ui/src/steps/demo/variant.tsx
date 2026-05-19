import React from 'react';
import { Steps, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size={32}>
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
    <Steps current={1} variant="navigation" direction="vertical" style={{ maxHeight: 200 }}>
      <Steps.Step title="第一步" description="描述信息" />
      <Steps.Step title="第二步" description="描述信息" />
      <Steps.Step title="第三步" description="描述信息" />
    </Steps>
  </Space>
);

export default Demo;
