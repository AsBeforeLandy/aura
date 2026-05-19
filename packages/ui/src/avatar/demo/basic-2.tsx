import React from 'react';
import { Avatar, AvatarGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Avatar>A</Avatar>
    <Avatar variant="primary">B</Avatar>
    <Avatar src="https://i.pravatar.cc/80?img=1" alt="用户头像" />
  </Space>

);

export default Demo;
