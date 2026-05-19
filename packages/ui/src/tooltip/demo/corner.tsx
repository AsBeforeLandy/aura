import React from 'react';
import { Tooltip, Button, Space, Flex } from '@aura/ui';


const Demo: React.FC = () => (
  <Flex justify="center" gap="md" style={{ padding: '60px 0' }}>
    <Tooltip content="左上" placement="topLeft">
      <Button>topLeft</Button>
    </Tooltip>
    <Tooltip content="右上" placement="topRight">
      <Button>topRight</Button>
    </Tooltip>
    <Tooltip content="左下" placement="bottomLeft">
      <Button>bottomLeft</Button>
    </Tooltip>
    <Tooltip content="右下" placement="bottomRight">
      <Button>bottomRight</Button>
    </Tooltip>
  </Flex>
);

export default Demo;
