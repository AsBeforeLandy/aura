import React from 'react';
import { Avatar, AvatarGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <AvatarGroup maxCount={3}>
      <Avatar>A</Avatar>
      <Avatar>B</Avatar>
      <Avatar>C</Avatar>
      <Avatar>D</Avatar>
      <Avatar>E</Avatar>
    </AvatarGroup>
    <AvatarGroup maxCount={4} size="sm" shape="square">
      <Avatar variant="primary">1</Avatar>
      <Avatar variant="primary">2</Avatar>
      <Avatar variant="primary">3</Avatar>
      <Avatar variant="primary">4</Avatar>
      <Avatar variant="primary">5</Avatar>
    </AvatarGroup>
  </Space>
);

export default Demo;
