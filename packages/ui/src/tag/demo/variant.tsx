import React from 'react';
import { Tag, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="sm">
    <Tag>默认</Tag>
    <Tag variant="primary">主要</Tag>
    <Tag variant="success">成功</Tag>
    <Tag variant="warning">警告</Tag>
    <Tag variant="error">错误</Tag>
    <Tag variant="info">信息</Tag>
  </Space>
);

export default Demo;
