import React, { useEffect, useState } from 'react';
import { Button, Card, Space } from 'antd';
import { NumberTicker } from '@aura-react-comp/motion';

/** 指标看板：value 变化时弹簧滚动 */
export default () => {
  const [base, setBase] = useState(128940);

  useEffect(() => {
    const id = setInterval(() => setBase((b) => b + Math.round(Math.random() * 900) + 100), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space wrap>
        <Card size="small" style={{ minWidth: 160 }}>
          <div style={{ color: '#5f5e5a', fontSize: 12 }}>累计请求</div>
          <NumberTicker value={base} style={{ fontSize: 28, fontWeight: 600 }} />
        </Card>
        <Card size="small" style={{ minWidth: 160 }}>
          <div style={{ color: '#5f5e5a', fontSize: 12 }}>成功率</div>
          <NumberTicker
            value={0.9856}
            format={(n) => `${(n * 100).toFixed(2)}%`}
            style={{ fontSize: 28, fontWeight: 600 }}
          />
        </Card>
        <Card size="small" style={{ minWidth: 160 }}>
          <div style={{ color: '#5f5e5a', fontSize: 12 }}>bouncy 弹簧</div>
          <NumberTicker
            value={base * 2}
            spring="bouncy"
            style={{ fontSize: 28, fontWeight: 600 }}
          />
        </Card>
      </Space>
      <Button onClick={() => setBase((b) => b + 5000)}>+5,000</Button>
    </Space>
  );
};
