import React from 'react';
import { Button, Space } from 'antd';
import { Typewriter } from '@aura-react-comp/motion';

const REPLY =
  '已为你生成季度报告：营收同比 +23%，其中订阅收入贡献 61%。建议下季度将增长预算向中小企业客户倾斜。';

/** 点击按钮重放打字机 */
export default () => {
  const [seed, setSeed] = React.useState(0);
  const [done, setDone] = React.useState(false);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: '#faf9f5',
          border: '1px solid #d3d1c7',
          minHeight: 88,
          lineHeight: 1.8,
        }}
      >
        <Typewriter
          key={seed}
          text={REPLY}
          speed={28}
          onComplete={() => setDone(true)}
        />
      </div>
      <Space>
        <Button onClick={() => { setDone(false); setSeed((s) => s + 1); }}>重放</Button>
        <span style={{ color: '#5f5e5a', fontSize: 12 }}>
          {done ? '✓ onComplete 已触发' : '输出中…'}
        </span>
      </Space>
    </Space>
  );
};
