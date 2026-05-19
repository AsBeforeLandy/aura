import React from 'react';
import { Space, Text, Flex } from '@aura/ui';
import { Button } from '../../button/index';

const Demo: React.FC = () => (
  <Flex align="center">
    <Space align="start">
      <Text style={{ fontSize: 12 }}>Start</Text>
      <Button>按钮</Button>
    </Space>
    <Space align="center" style={{ marginLeft: 16 }}>
      <Text style={{ fontSize: 12 }}>Center</Text>
      <Button>按钮</Button>
    </Space>
    <Space align="baseline" style={{ marginLeft: 16 }}>
      <Text style={{ fontSize: 12 }}>Baseline</Text>
      <Button>按钮</Button>
    </Space>
  </Flex>
);

export default Demo;
