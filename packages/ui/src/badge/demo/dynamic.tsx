import React, { useState } from 'react';
import { Badge, Button, Space, Card } from '@aura/ui';

const Demo: React.FC = () => {
  const [count, setCount] = useState(5);

  return (
    <Space align="center" size="md">
      <Button onClick={() => setCount(Math.max(0, count - 1))}>-</Button>
      <Badge count={count}>
        <Card style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} size="sm">{count}</Card>
      </Badge>
      <Button onClick={() => setCount(count + 1)}>+</Button>
    </Space>
  );
};

export default Demo;
