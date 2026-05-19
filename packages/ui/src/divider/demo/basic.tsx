import React from 'react';
import { Divider, Text, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="sm">
    <Text>上方内容区域</Text>
    <Divider />
    <Text>下方内容区域</Text>
    <Divider variant="dashed" />
    <Text>虚线分割线</Text>
  </Space>
);

export default Demo;
