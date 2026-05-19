import React from 'react';
import { Tabs, TabItem } from '@aura/ui';

const Demo: React.FC = () => (
  <Tabs variant="card" defaultActiveKey="x">
    <TabItem tabKey="x" title="用户管理">用户管理面板内容</TabItem>
    <TabItem tabKey="y" title="角色配置">角色配置面板内容</TabItem>
    <TabItem tabKey="z" title="权限设置" disabled>权限设置面板（已禁用）</TabItem>
  </Tabs>
);

export default Demo;
