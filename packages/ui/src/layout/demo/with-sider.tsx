import React, { useState } from 'react';
import { Layout, Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');
  return (
    <Layout hasSider style={{ minHeight: 360, border: '1px solid var(--aura-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Layout.Sider collapsible width={200}>
        <Menu
          mode="inline"
          selectedKey={selected}
          onSelect={setSelected}
          style={{ border: 'none', background: 'transparent' }}
        >
          <Menu.Item itemKey="home">首页</Menu.Item>
          <Menu.Item itemKey="data">数据</Menu.Item>
          <Menu.SubMenu subKey="system" title="系统管理">
            <Menu.Item itemKey="users">用户管理</Menu.Item>
            <Menu.Item itemKey="roles">角色管理</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item itemKey="settings">设置</Menu.Item>
          <Menu.Item itemKey="help">帮助</Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <span style={{ fontWeight: 600 }}>页面头部</span>
        </Layout.Header>
        <Layout.Body>
          <h3>主内容区域</h3>
          <p>当前选中：{selected}</p>
          <p>点击侧边栏底部的按钮可以折叠/展开侧边栏。</p>
        </Layout.Body>
        <Layout.Footer>
          &copy; 2026 Aura UI
        </Layout.Footer>
      </Layout>
    </Layout>
  );
};

export default Demo;
