import React from 'react';
import { Typography, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Typography>
      <Typography.Title level={1}>H1 标题</Typography.Title>
      <Typography.Title level={2}>H2 标题</Typography.Title>
      <Typography.Title level={3}>H3 标题</Typography.Title>
      <Typography.Title level={4}>H4 标题</Typography.Title>
      <Typography.Title level={5}>H5 标题</Typography.Title>
      <Space wrap size="md">
        <Typography.Text>默认文本</Typography.Text>
        <Typography.Text variant="secondary">次要文本</Typography.Text>
        <Typography.Text variant="success">成功文本</Typography.Text>
        <Typography.Text variant="warning">警告文本</Typography.Text>
        <Typography.Text variant="danger">危险文本</Typography.Text>
      </Space>
      <Space wrap size="md">
        <Typography.Text strong>加粗文本</Typography.Text>
        <Typography.Text underline>下划线文本</Typography.Text>
        <Typography.Text delete>删除线文本</Typography.Text>
        <Typography.Text code>代码文本</Typography.Text>
        <Typography.Text mark>高亮文本</Typography.Text>
      </Space>
      <Typography.Paragraph>
        这是一段正文内容，用于展示 Paragraph 组件的默认样式。段落文本支持多行显示，
        具有适当的行高和间距，确保良好的阅读体验。
      </Typography.Paragraph>
      <Typography.Paragraph ellipsis>
        这是一段很长的文本，启用了单行省略模式，超出部分会以省略号显示，适用于卡片或列表中的简介。
      </Typography.Paragraph>
    </Typography>
  </Space>
);

export default Demo;
