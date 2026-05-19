import React from 'react';
import { Popconfirm, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Popconfirm
    title="确认删除这条记录？"
    description="删除后将无法恢复"
    onConfirm={() => console.log('确认删除')}
  >
    <Button>删除记录</Button>
  </Popconfirm>
);

export default Demo;
