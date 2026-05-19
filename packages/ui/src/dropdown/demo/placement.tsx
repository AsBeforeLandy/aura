import React from 'react';
import { Dropdown, Button, Space } from '@aura/ui';

const menu = [
  { key: '1', label: '编辑' },
  { key: '2', label: '复制' },
  { key: '3', label: '删除', danger: true },
];

const Demo: React.FC = () => (
  <Space direction="vertical" size="lg">
    <Space size="md">
      <Dropdown menu={menu} placement="top" onMenuClick={(key) => console.log(key)}>
        <Button>上方</Button>
      </Dropdown>
      <Dropdown menu={menu} placement="bottom" onMenuClick={(key) => console.log(key)}>
        <Button>下方</Button>
      </Dropdown>
      <Dropdown menu={menu} placement="left" onMenuClick={(key) => console.log(key)}>
        <Button>左侧</Button>
      </Dropdown>
      <Dropdown menu={menu} placement="right" onMenuClick={(key) => console.log(key)}>
        <Button>右侧</Button>
      </Dropdown>
    </Space>
    <Space size="md">
      <Dropdown menu={menu} placement="bottomLeft" onMenuClick={(key) => console.log(key)}>
        <Button>左下</Button>
      </Dropdown>
      <Dropdown menu={menu} placement="bottomRight" onMenuClick={(key) => console.log(key)}>
        <Button>右下</Button>
      </Dropdown>
      <Dropdown menu={menu} placement="topLeft" onMenuClick={(key) => console.log(key)}>
        <Button>左上</Button>
      </Dropdown>
      <Dropdown menu={menu} placement="topRight" onMenuClick={(key) => console.log(key)}>
        <Button>右上</Button>
      </Dropdown>
    </Space>
  </Space>
);

export default Demo;
