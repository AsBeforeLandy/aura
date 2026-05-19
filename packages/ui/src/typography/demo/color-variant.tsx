import React from 'react';
import { Typography, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="md">
    <Typography.Text>默认文本</Typography.Text>
    <Typography.Text variant="secondary">次要文本</Typography.Text>
    <Typography.Text variant="success">成功文本</Typography.Text>
    <Typography.Text variant="warning">警告文本</Typography.Text>
    <Typography.Text variant="danger">危险文本</Typography.Text>
  </Space>

);

export default Demo;
