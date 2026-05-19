import React from 'react';
import { notification, Space, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="md">
    {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map(
      (placement) => (
        <Button
          key={placement}
          onClick={() =>
            notification.open({
              title: `位置：${placement}`,
              content: `这条通知出现在 ${placement}`,
              placement,
            })
          }
          style={{
            padding: '6px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {placement}
        </Button>
      ),
    )}
  </Space>
);

export default Demo;
