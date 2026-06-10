import React, { useState } from 'react';
import { Spin, Text, Button, Card, Space } from '@aura/ui';

const Demo: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [delayedSpinning, setDelayedSpinning] = useState(false);

  return (
    <Space direction="vertical" size="md">
      <Space size="md">
        <Button onClick={() => setSpinning(!spinning)}>
          {spinning ? '停止加载' : '开始加载'}
        </Button>
        <Button
          onClick={() => {
            setDelayedSpinning(true);
            // 模拟快速请求：500ms 后完成，延迟 400ms 则不会闪烁
            setTimeout(() => setDelayedSpinning(false), 500);
          }}
        >
          快速加载（delay=400ms 防闪烁）
        </Button>
      </Space>

      <Spin spinning={spinning} tip="加载中...">
        <Card size="sm" variant="outlined">
          <Text>这是一段需要加载的内容区域。</Text>
          <Text>当 spinning 为 true 时，内容会被半透明遮罩覆盖。</Text>
        </Card>
      </Spin>

      <Spin spinning={delayedSpinning} delay={400} tip="加载中...">
        <Card size="sm" variant="outlined">
          <Text>设置了 delay 的容器。</Text>
          <Text>如果请求在 400ms 内完成，加载动画不会出现。</Text>
        </Card>
      </Spin>
    </Space>
  );
};

export default Demo;
