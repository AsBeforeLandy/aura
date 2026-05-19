import React, { useState } from 'react';
import { Spin, Button, Text, Space, Card } from '@aura/ui';

const Demo: React.FC = () => {
  const [spinning, setSpinning] = useState(true);

  return (
    <Space direction="vertical" size="lg">
      <Space align="center" size="md">
        <Spin size="sm" />
        <Spin size="md" />
        <Spin size="lg" />
      </Space>
      <Spin tip="加载中..." />
      <Spin indicator={<Text style={{ fontSize: 24 }}>&#x1F504;</Text>} />
      <Space direction="vertical" size={12}>
        <Button onClick={() => setSpinning(!spinning)} size="sm">
          切换加载状态（当前：{spinning ? '加载中' : '已完成'}）
        </Button>
        <Spin spinning={spinning} tip="正在加载...">
          <Card size="sm" variant="outlined">
            <Text>这是需要加载的内容区域。</Text>
            <Text>当 spinning 为 true 时，内容会变半透明并显示加载图标。</Text>
          </Card>
        </Spin>
      </Space>
    </Space>
  );
};

export default Demo;
