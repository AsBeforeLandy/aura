import React, { useState } from 'react';
import { Tabs, TabItem, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [activeKey, setActiveKey] = useState('home');

  return (
    <Space direction="vertical" size="sm">
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabItem tabKey="home" title="主页">主页内容</TabItem>
        <TabItem tabKey="profile" title="个人中心">个人中心内容</TabItem>
        <TabItem tabKey="settings" title="设置">设置内容</TabItem>
      </Tabs>
      <Text>当前激活：{activeKey}</Text>
    </Space>
  );
};

export default Demo;
