import React from 'react';
import { Popconfirm, Button, Space, Flex } from '@aura/ui';


const Demo: React.FC = () => (
  <Flex justify="center" gap="md" style={{ padding: '60px 0' }}>
    <Popconfirm title="上方" placement="top">
      <Button>上</Button>
    </Popconfirm>
    <Popconfirm title="下方" placement="bottom">
      <Button>下</Button>
    </Popconfirm>
    <Popconfirm title="左侧" placement="left">
      <Button>左</Button>
    </Popconfirm>
    <Popconfirm title="右侧" placement="right">
      <Button>右</Button>
    </Popconfirm>
  </Flex>
);

export default Demo;
