import React from 'react';
import { Popconfirm, Space, Button } from '@aura/ui';

const btnStyle: React.CSSProperties = {
  padding: '4px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 4,
  cursor: 'pointer',
  background: '#fff',
};

const Demo: React.FC = () => (
  <Space size="md">
    <Popconfirm title="确认删除？" placement="top" onConfirm={() => console.log('上')}>
      <Button>上方</Button>
    </Popconfirm>
    <Popconfirm title="确认删除？" placement="bottom" onConfirm={() => console.log('下')}>
      <Button>下方</Button>
    </Popconfirm>
    <Popconfirm title="确认删除？" placement="left" onConfirm={() => console.log('左')}>
      <Button>左侧</Button>
    </Popconfirm>
    <Popconfirm title="确认删除？" placement="right" onConfirm={() => console.log('右')}>
      <Button>右侧</Button>
    </Popconfirm>
  </Space>
);

export default Demo;
