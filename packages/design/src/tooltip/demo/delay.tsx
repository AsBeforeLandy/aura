import React from 'react';
import { Tooltip, Button } from '@aura-react-comp/design';

const Demo: React.FC = () => (
  <Tooltip content="延迟 500ms 显示" delay={500}>
    <Button>延迟 500ms</Button>
  </Tooltip>
);

export default Demo;
