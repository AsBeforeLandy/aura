import React from 'react';
import { Typography, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space wrap size="md">
    <Typography.Text strong>加粗文本</Typography.Text>
    <Typography.Text underline>下划线文本</Typography.Text>
    <Typography.Text delete>删除线文本</Typography.Text>
    <Typography.Text code>代码文本</Typography.Text>
    <Typography.Text mark>高亮文本</Typography.Text>
  </Space>

);

export default Demo;
