import React, { useState } from 'react';
import { Steps, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [current, setCurrent] = useState(1);

  return (
    <Space direction="vertical" size="sm">
      <Steps current={current} onChange={setCurrent}>
        <Steps.Step title="账号信息" description="填写基本信息" />
        <Steps.Step title="身份验证" description="验证邮箱或手机" />
        <Steps.Step title="完成注册" description="开始使用" />
      </Steps>
      <Text>当前步骤：{current}</Text>
    </Space>
  );
};

export default Demo;
