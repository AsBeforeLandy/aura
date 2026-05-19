import React, { useState } from 'react';
import { Button, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Space wrap align="center" size="md">
      <Button variant="primary" loading>
        加载中
      </Button>
      <Button variant="primary" loading={loading} onClick={handleClick}>
        {loading ? '提交中...' : '点击提交'}
      </Button>
    </Space>
  );
};

export default Demo;
