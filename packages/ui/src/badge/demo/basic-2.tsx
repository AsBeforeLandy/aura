import React from 'react';
import { Badge, Space, Card } from '@aura/ui';

const Demo: React.FC = () => (
  <Space align="center" size="lg">
    <Badge count={5}>
      <Card style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} size="sm">邮件</Card>
    </Badge>
    <Badge count={0} showZero>
      <Card style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} size="sm">消息</Card>
    </Badge>
    <Badge dot>
      <Card style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} size="sm">通知</Card>
    </Badge>
  </Space>
);

export default Demo;
