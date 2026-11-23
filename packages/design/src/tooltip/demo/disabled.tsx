import React from 'react';
import { Tooltip, Button } from '@aura-react-comp/design';

const Demo: React.FC = () => (
  <Tooltip content="不会显示" disabled>
    <Button>禁用提示</Button>
  </Tooltip>
);

export default Demo;
