import React from 'react';
import { Avatar, AvatarGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Avatar size="sm">S</Avatar>
    <Avatar size="md">M</Avatar>
    <Avatar size="lg">L</Avatar>
    <Avatar size={64}>XL</Avatar>
  </Space>

);

export default Demo;
