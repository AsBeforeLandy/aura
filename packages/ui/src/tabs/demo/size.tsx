import React from 'react';
import { Tabs, TabItem, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="lg">
    <Tabs size="sm" defaultActiveKey="tab1">
      <TabItem tabKey="tab1" title="小号 1">小号内容</TabItem>
      <TabItem tabKey="tab2" title="小号 2">小号内容</TabItem>
    </Tabs>
    <Tabs size="md" defaultActiveKey="tab1">
      <TabItem tabKey="tab1" title="中号 1">中号内容</TabItem>
      <TabItem tabKey="tab2" title="中号 2">中号内容</TabItem>
    </Tabs>
    <Tabs size="lg" defaultActiveKey="tab1">
      <TabItem tabKey="tab1" title="大号 1">大号内容</TabItem>
      <TabItem tabKey="tab2" title="大号 2">大号内容</TabItem>
    </Tabs>
  </Space>
);

export default Demo;
