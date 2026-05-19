import React from 'react';
import { Tabs, TabItem, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="md">
    <Tabs size="sm" defaultActiveKey="a">
      <TabItem tabKey="a" title="小号 A">小号内容 A</TabItem>
      <TabItem tabKey="b" title="小号 B">小号内容 B</TabItem>
    </Tabs>
    <Tabs size="md" defaultActiveKey="a">
      <TabItem tabKey="a" title="中号 A">中号内容 A</TabItem>
      <TabItem tabKey="b" title="中号 B">中号内容 B</TabItem>
    </Tabs>
    <Tabs size="lg" defaultActiveKey="a">
      <TabItem tabKey="a" title="大号 A">大号内容 A</TabItem>
      <TabItem tabKey="b" title="大号 B">大号内容 B</TabItem>
    </Tabs>
  </Space>
);

export default Demo;
