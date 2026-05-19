import React from 'react';
import { Tooltip, Button, Flex } from '@aura/ui';

const Demo: React.FC = () => (
  <Flex wrap gap="sm" style={{ maxWidth: 400 }}>
    <Tooltip content="上方" placement="top"><Button size="sm">上</Button></Tooltip>
    <Tooltip content="下方" placement="bottom"><Button size="sm">下</Button></Tooltip>
    <Tooltip content="左侧" placement="left"><Button size="sm">左</Button></Tooltip>
    <Tooltip content="右侧" placement="right"><Button size="sm">右</Button></Tooltip>
    <Tooltip content="左上" placement="topLeft"><Button size="sm">左上</Button></Tooltip>
    <Tooltip content="右上" placement="topRight"><Button size="sm">右上</Button></Tooltip>
    <Tooltip content="左下" placement="bottomLeft"><Button size="sm">左下</Button></Tooltip>
    <Tooltip content="右下" placement="bottomRight"><Button size="sm">右下</Button></Tooltip>
  </Flex>
);

export default Demo;
