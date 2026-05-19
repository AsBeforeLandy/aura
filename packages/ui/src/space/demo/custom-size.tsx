import React from 'react';
import { Space } from '@aura/ui';
import { Button } from '../../button/index';

const Demo: React.FC = () => (
  <Space size={32}>
    <Button>32px</Button>
    <Button>32px</Button>
  </Space>
);

export default Demo;
