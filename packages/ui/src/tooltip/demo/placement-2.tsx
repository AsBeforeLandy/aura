import React from 'react';
import { Tooltip, Button, Flex } from '@aura/ui';


const Demo: React.FC = () => (
  <Flex justify="center" gap="md" style={{ padding: '60px 0' }}>
    <Tooltip content="上方提示" placement="top">
      <Button>上</Button>
    </Tooltip>
    <Tooltip content="下方提示" placement="bottom">
      <Button>下</Button>
    </Tooltip>
    <Tooltip content="左侧提示" placement="left">
      <Button>左</Button>
    </Tooltip>
    <Tooltip content="右侧提示" placement="right">
      <Button>右</Button>
    </Tooltip>
  </Flex>
);

export default Demo;
