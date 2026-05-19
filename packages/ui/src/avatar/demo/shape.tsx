import React from 'react';
import { Avatar, AvatarGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="md">
    <Avatar shape="circle">圆</Avatar>
    <Avatar shape="square">方</Avatar>
    <Avatar shape="square" variant="primary">方</Avatar>
  </Space>

);

export default Demo;
