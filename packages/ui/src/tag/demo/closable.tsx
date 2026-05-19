import React from 'react';
import { Tag, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const handleClose = () => {
    console.log('标签已关闭');
  };

  return (
    <Space wrap size="sm">
      <Tag closable onClose={handleClose}>可关闭</Tag>
      <Tag variant="primary" closable>主要标签</Tag>
      <Tag variant="success" closable>成功标签</Tag>
    </Space>
  );
};

export default Demo;
