import React from 'react';
import { Popconfirm, Button, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space size="md">
    <Popconfirm
      title="确认删除？"
      onConfirm={() => console.log('确认')}
      onCancel={() => console.log('取消')}
    >
      <Button>删除</Button>
    </Popconfirm>
  </Space>
);

export default Demo;
