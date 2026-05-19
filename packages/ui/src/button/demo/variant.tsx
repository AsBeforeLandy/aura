import React from 'react';
import { Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap align="center" size="md">
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="dashed">Dashed</Button>
    <Button variant="text">Text</Button>
    <Button variant="link">Link</Button>
  </Space>
);

export default Demo;
