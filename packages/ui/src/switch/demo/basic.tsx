import React, { useState } from 'react';
import { Switch, Space, Text } from '@aura/ui';

const Demo: React.FC = () => {
  const [checked, setChecked] = useState(false);
  return (
    <Space direction="vertical" size="md">
      <Space align="center" size="md">
        <Switch />
        <Switch defaultChecked />
      </Space>
      <Space align="center" size="md">
        <Text>带文字：</Text>
        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
      </Space>
      <Space align="center" size="md">
        <Text>受控：</Text>
        <Switch checked={checked} onChange={setChecked} />
        <Text>{checked ? '已开启' : '已关闭'}</Text>
      </Space>
      <Space align="center" size="md">
        <Text>禁用：</Text>
        <Switch disabled />
        <Switch disabled defaultChecked />
      </Space>
    </Space>
  );
};

export default Demo;
