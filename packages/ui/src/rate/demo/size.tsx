import React, { useState } from 'react';
import { Rate, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [value, setValue] = useState(3);

  return (
  <Space direction="vertical" size="sm">
    <Rate size="sm" value={3} />
    <Rate size="md" value={3} />
    <Rate size="lg" value={3} />
  </Space>
);
};

export default Demo;
