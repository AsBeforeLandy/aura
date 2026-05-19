import React, { useState } from 'react';
import { Layout, Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('overview');
  return (
    <Layout hasSider style={{ minHeight: 300, border: '1px solid var(--aura-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Layout.Sider width={240}>
        <Menu
          mode="inline"
          selectedKey={selected}
          onSelect={setSelected}
          style={{ border: 'none', background: 'transparent' }}
        >
          <Menu.Item itemKey="overview">概览</Menu.Item>
          <Menu.Item itemKey="projects">项目</Menu.Item>
          <Menu.Item itemKey="members">成员</Menu.Item>
          <Menu.Item itemKey="settings">项目设置</Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <span style={{ fontWeight: 600 }}>项目工作台</span>
        </Layout.Header>
        <Layout.Body>
          <h3>{selected === 'overview' ? '概览' : selected}</h3>
          <p>侧边栏使用 Menu 组件，宽度 240px，内容区域自适应。</p>
        </Layout.Body>
      </Layout>
    </Layout>
  );
};

export default Demo;
