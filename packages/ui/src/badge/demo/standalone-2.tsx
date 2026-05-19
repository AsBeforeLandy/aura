import React from 'react';
import { Badge, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Badge count={99} />
    <Badge count={100} overflowCount={99} />
    <Badge count={0} showZero />
    <Badge dot count={1} />
  </Space>

);

export default Demo;
