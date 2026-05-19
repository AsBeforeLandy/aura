import React from 'react';
import { Popconfirm, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space size="md">
    <Popconfirm title="默认确认" variant="default">
      <Button>默认</Button>
    </Popconfirm>
    <Popconfirm title="警告确认" variant="warning">
      <Button>警告</Button>
    </Popconfirm>
    <Popconfirm title="危险确认" variant="error">
      <Button>危险</Button>
    </Popconfirm>
  </Space>
);

export default Demo;
