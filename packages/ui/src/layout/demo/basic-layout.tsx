import React, { useState } from 'react';
import { Layout, Menu } from '@aura/ui';

const Demo: React.FC = () => {
  const [selected, setSelected] = useState('home');
  return (
    <Layout style={{ minHeight: 300, border: '1px solid var(--aura-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Layout.Header>
        <span style={{ fontWeight: 700, fontSize: 16, marginRight: 32 }}>Aura UI</span>
        <Menu
          mode="horizontal"
          selectedKey={selected}
          onSelect={setSelected}
          style={{ border: 'none', background: 'transparent', flex: 1 }}
        >
          <Menu.Item itemKey="home">首页</Menu.Item>
          <Menu.Item itemKey="docs">文档</Menu.Item>
          <Menu.Item itemKey="components">组件</Menu.Item>
          <Menu.Item itemKey="about">关于</Menu.Item>
        </Menu>
      </Layout.Header>
      <Layout.Body>
        <h3>主体内容</h3>
        <p>当前选中：{selected}</p>
      </Layout.Body>
      <Layout.Footer>
        &copy; 2026 Aura UI
      </Layout.Footer>
    </Layout>
  );
};

export default Demo;
