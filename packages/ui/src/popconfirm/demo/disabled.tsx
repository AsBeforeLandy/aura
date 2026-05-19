import React from 'react';
import { Popconfirm, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Popconfirm title="不会弹出" disabled>
    <Button>禁用确认</Button>
  </Popconfirm>
);

export default Demo;
