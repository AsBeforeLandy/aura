import React from 'react';
import { Switch, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Switch loading />
    <Switch loading defaultChecked />
  </Space>
);

export default Demo;
