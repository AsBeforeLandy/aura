import React from 'react';
import { Result, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Result
    variant="error"
    title="提交失败"
    subtitle="请检查网络连接后重试，或联系技术支持。"
    extra={
      <Space size="sm">
        <Button>取消</Button>
        <Button variant="primary">重试</Button>
      </Space>
    }
  />
);

export default Demo;
