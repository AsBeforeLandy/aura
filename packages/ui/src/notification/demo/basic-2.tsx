import React from 'react';
import { notification, Space, Button } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="md">
    <Button
      onClick={() =>
        notification.open({
          title: '系统通知',
          content: '这是一条默认通知消息',
        })
      }
      style={{
        padding: '6px 16px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      Default
    </Button>
    <Button
      onClick={() =>
        notification.success({
          title: '操作成功',
          content: '数据已保存成功',
        })
      }
      style={{
        padding: '6px 16px',
        border: 'none',
        background: '#10b981',
        color: '#fff',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      Success
    </Button>
    <Button
      onClick={() =>
        notification.error({
          title: '操作失败',
          content: '网络请求超时，请稍后重试',
        })
      }
      style={{
        padding: '6px 16px',
        border: 'none',
        background: '#ef4444',
        color: '#fff',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      Error
    </Button>
    <Button
      onClick={() =>
        notification.warning({
          title: '警告',
          content: '磁盘空间即将不足',
        })
      }
      style={{
        padding: '6px 16px',
        border: 'none',
        background: '#f59e0b',
        color: '#fff',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      Warning
    </Button>
    <Button
      onClick={() =>
        notification.info({
          title: '信息',
          content: '系统将在今晚 22:00 进行维护',
        })
      }
      style={{
        padding: '6px 16px',
        border: 'none',
        background: '#3b82f6',
        color: '#fff',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      Info
    </Button>
  </Space>
);

export default Demo;
