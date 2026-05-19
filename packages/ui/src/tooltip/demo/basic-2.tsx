import React from 'react';
import { Tooltip, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space size="md">
    <Tooltip content="这是一个提示">
      <Button>悬停我</Button>
    </Tooltip>
  </Space>
);

export default Demo;
