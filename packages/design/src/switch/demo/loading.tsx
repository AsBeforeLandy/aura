import React from 'react';
import { Switch, Space } from '@aura-react-comp/design';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Switch loading />
    <Switch loading defaultChecked />
  </Space>
);

export default Demo;
