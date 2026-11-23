import React from 'react';
import { Avatar, AvatarGroup } from '@aura-react-comp/design';

const Demo: React.FC = () => (
  <AvatarGroup maxCount={3} size="md">
    <Avatar>A</Avatar>
    <Avatar>B</Avatar>
    <Avatar>C</Avatar>
    <Avatar>D</Avatar>
    <Avatar>E</Avatar>
  </AvatarGroup>
);

export default Demo;
