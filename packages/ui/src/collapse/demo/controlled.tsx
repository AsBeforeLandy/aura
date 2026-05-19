import React, { useState } from 'react';
import { Collapse, Text, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [keys, setKeys] = useState(['1']);

  return (
    <Space direction="vertical" size="sm">
      <Text>当前展开: {keys.join(', ') || '无'}</Text>
      <Collapse activeKey={keys} onChange={setKeys}>
        <Collapse.Item itemKey="1" title="受控面板1">
          受控面板的内容。
        </Collapse.Item>
        <Collapse.Item itemKey="2" title="受控面板2">
          通过外部 state 控制。
        </Collapse.Item>
      </Collapse>
    </Space>
  );
};

export default Demo;
