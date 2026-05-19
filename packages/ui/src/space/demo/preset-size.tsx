import React from 'react';
import { Space } from '@aura/ui';
import { Button } from '../../button/index';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Space size="sm">
      <Button>Small</Button>
      <Button>Small</Button>
    </Space>
    <Space size="md">
      <Button>Medium</Button>
      <Button>Medium</Button>
    </Space>
    <Space size="lg">
      <Button>Large</Button>
      <Button>Large</Button>
    </Space>
  </Space>
);

export default Demo;
