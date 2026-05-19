import React from 'react';
import { Tabs, TabItem, Space } from '@aura/ui';

const Demo: React.FC = () => (
  <Space direction="vertical" size="lg">
    <Tabs variant="default" defaultActiveKey="tab1">
      <TabItem tabKey="tab1" title="Default 1">默认变体内容 1</TabItem>
      <TabItem tabKey="tab2" title="Default 2">默认变体内容 2</TabItem>
      <TabItem tabKey="tab3" title="Default 3">默认变体内容 3</TabItem>
    </Tabs>
    <Tabs variant="card" defaultActiveKey="tab1">
      <TabItem tabKey="tab1" title="Card 1">卡片变体内容 1</TabItem>
      <TabItem tabKey="tab2" title="Card 2">卡片变体内容 2</TabItem>
      <TabItem tabKey="tab3" title="Card 3">卡片变体内容 3</TabItem>
    </Tabs>
    <Tabs variant="pill" defaultActiveKey="tab1">
      <TabItem tabKey="tab1" title="Pill 1">胶囊变体内容 1</TabItem>
      <TabItem tabKey="tab2" title="Pill 2">胶囊变体内容 2</TabItem>
      <TabItem tabKey="tab3" title="Pill 3">胶囊变体内容 3</TabItem>
    </Tabs>
  </Space>
);

export default Demo;
