import React from 'react';
import { Avatar, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Space align="center" size="md">
      <Avatar size="sm">A</Avatar>
      <Avatar size="md">B</Avatar>
      <Avatar size="lg">C</Avatar>
      <Avatar size={56}>D</Avatar>
    </Space>
    <Space align="center" size="md">
      <Avatar shape="circle">E</Avatar>
      <Avatar shape="square">F</Avatar>
      <Avatar shape="circle" variant="primary">G</Avatar>
      <Avatar shape="square" variant="primary">H</Avatar>
    </Space>
  </Space>
);

export default Demo;
