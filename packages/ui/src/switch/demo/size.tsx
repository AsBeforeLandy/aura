import React from 'react';
import { Switch, Space, Text } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Space align="center" size="md">
      <Text>Small:</Text>
      <Switch size="sm" />
      <Switch size="sm" defaultChecked />
    </Space>
    <Space align="center" size="md">
      <Text>Medium:</Text>
      <Switch />
      <Switch defaultChecked />
    </Space>
    <Space align="center" size="md">
      <Text>Large:</Text>
      <Switch size="lg" />
      <Switch size="lg" defaultChecked />
    </Space>
  </Space>
);

export default Demo;
