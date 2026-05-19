import React from 'react';
import { Badge, Text, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="lg">
    <Badge count={5} variant="default">
      <Text>默认</Text>
    </Badge>
    <Badge count={5} variant="success">
      <Text>成功</Text>
    </Badge>
    <Badge count={5} variant="warning">
      <Text>警告</Text>
    </Badge>
    <Badge count={5} variant="error">
      <Text>错误</Text>
    </Badge>
    <Badge count={5} variant="info">
      <Text>信息</Text>
    </Badge>
  </Space>
);

export default Demo;
