import React from 'react';
import { Steps, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm" style={{ maxWidth: 400 }}>
    <Steps current={1} direction="vertical">
      <Steps.Step title="创建项目" description="选择项目模板" />
      <Steps.Step title="配置参数" description="设置环境变量" />
      <Steps.Step title="部署上线" description="发布到生产环境" />
    </Steps>
  </Space>
);

export default Demo;
