import React from 'react';
import { Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap align="center" size="md">
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="dashed">Dashed</Button>
    <Button variant="text">Text</Button>
    <Button variant="link">Link</Button>
    <Button variant="primary" size="sm">Small</Button>
    <Button variant="primary" size="lg">Large</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </Space>
);

export default Demo;
