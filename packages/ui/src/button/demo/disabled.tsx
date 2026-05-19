import React from 'react';
import { Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap align="center" size="md">
    <Button disabled>Default</Button>
    <Button variant="primary" disabled>Primary</Button>
    <Button variant="dashed" disabled>Dashed</Button>
    <Button variant="text" disabled>Text</Button>
    <Button variant="link" disabled>Link</Button>
  </Space>
);

export default Demo;
