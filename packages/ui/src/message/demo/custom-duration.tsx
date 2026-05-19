import React from 'react';
import { message, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Button onClick={() => message.success('10 秒后消失', 10000)}>
    10 秒消息
  </Button>
);

export default Demo;
