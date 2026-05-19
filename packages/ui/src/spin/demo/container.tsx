import React, { useState } from 'react';
import { Spin, Text, Button, Card, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [spinning, setSpinning] = useState(true);

  return (
    <Space direction="vertical" size="md">
      <Button onClick={() => setSpinning(!spinning)}>
        {spinning ? '停止加载' : '开始加载'}
      </Button>
      <Spin spinning={spinning} tip="加载中...">
        <Card size="sm" variant="outlined">
          <Text>这是一段需要加载的内容区域。</Text>
          <Text>当 spinning 为 true 时，内容会被半透明遮罩覆盖。</Text>
        </Card>
      </Spin>
    </Space>
  );
};

export default Demo;
