import React from 'react';
import { Popconfirm, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Popconfirm
    title="是否保存更改？"
    okText="保存"
    cancelText="不保存"
    onConfirm={() => console.log('保存')}
  >
    <Button>保存更改</Button>
  </Popconfirm>
);

export default Demo;
