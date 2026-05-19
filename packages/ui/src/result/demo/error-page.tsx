import React from 'react';
import { Result, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size={32}>
    <Result
      variant="404"
      title="404"
      subtitle="抱歉，您访问的页面不存在。"
    />
    <Result
      variant="403"
      title="403"
      subtitle="抱歉，您没有权限访问此页面。"
    />
    <Result
      variant="500"
      title="500"
      subtitle="抱歉，服务器出了点问题。"
    />
  </Space>
);

export default Demo;
