import React from 'react';
import { Divider, Space, Button, Text } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Space align="center">
      <Button>按钮 A</Button>
      <Divider direction="vertical" />
      <Button variant="primary">按钮 B</Button>
      <Divider direction="vertical" />
      <Text>链接</Text>
    </Space>
    <Space align="center">
      <Text>文本</Text>
      <Divider direction="vertical" variant="dashed" />
      <Text>文本</Text>
    </Space>
  </Space>
);

export default Demo;
