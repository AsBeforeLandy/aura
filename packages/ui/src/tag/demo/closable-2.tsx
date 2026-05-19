import React from 'react';
import { Tag, TagCheckable, TagGroup, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="sm">
    <Tag closable variant="primary">可关闭标签</Tag>
    <Tag closable variant="success">成功</Tag>
    <Tag closable variant="warning">警告</Tag>
    <Tag closable variant="error">错误</Tag>
  </Space>

);

export default Demo;
