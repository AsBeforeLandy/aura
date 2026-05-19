import React from 'react';
import { Tag, TagCheckable, TagGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="sm">
    <Tag>Default</Tag>
    <Tag variant="primary">Primary</Tag>
    <Tag variant="success">Success</Tag>
    <Tag variant="warning">Warning</Tag>
    <Tag variant="error">Error</Tag>
    <Tag variant="info">Info</Tag>
  </Space>

);

export default Demo;
