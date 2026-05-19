import React from 'react';
import { notification, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Button
    onClick={() =>
      notification.open({
        title: '快速消失',
        content: '2 秒后自动关闭',
        duration: 2000,
      })
    }
    style={{
      padding: '6px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      cursor: 'pointer',
    }}
  >
    2 秒消息
  </Button>
);

export default Demo;
