import React from 'react';
import { Tabs, TabItem } from '@aura/ui';

const Demo: React.FC = () => (
  <Tabs defaultActiveKey="a">
    <TabItem tabKey="a" title="首页">这是首页的内容，包含最新的动态信息。</TabItem>
    <TabItem tabKey="b" title="设置">这是设置页的内容，可以调整参数配置。</TabItem>
    <TabItem tabKey="c" title="关于">这是关于页的内容，展示版本信息。</TabItem>
  </Tabs>
);

export default Demo;
