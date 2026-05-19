import React from 'react';
import { Tag, TagCheckable, TagGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="sm">
    <TagCheckable>React</TagCheckable>
    <TagCheckable>Vue</TagCheckable>
    <TagCheckable>Angular</TagCheckable>
  </Space>

);

export default Demo;
