import React from 'react';
import { Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap align="center" size="md">
    <Button variant="primary" size="sm">Small</Button>
    <Button variant="primary" size="md">Medium</Button>
    <Button variant="primary" size="lg">Large</Button>
  </Space>
);

export default Demo;
