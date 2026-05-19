import React from 'react';
import { Typography, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Typography.Paragraph>
      这是一段正文内容，用于展示 Paragraph 组件的默认样式。段落文本支持多行显示，
      具有适当的行高和间距，确保良好的阅读体验。
    </Typography.Paragraph>

    <Typography.Paragraph ellipsis>
      这是一段很长的文本，启用了单行省略模式，超出部分会以省略号显示。
      适用于卡片或列表中的简介内容，当文本超出容器宽度时自动截断。
    </Typography.Paragraph>
  </Space>
);

export default Demo;
