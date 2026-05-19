import React from 'react';
import { Tabs, TabItem } from '@aura/ui';

const Demo: React.FC = () => (
  <Tabs variant="pill" defaultActiveKey="1">
    <TabItem tabKey="1" title="日视图">日视图面板</TabItem>
    <TabItem tabKey="2" title="周视图">周视图面板</TabItem>
    <TabItem tabKey="3" title="月视图">月视图面板</TabItem>
  </Tabs>
);

export default Demo;
