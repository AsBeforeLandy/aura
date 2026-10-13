import React from 'react';
import { Button, Space } from 'antd';
import { PathDraw } from '@aura-react-comp/motion';

/** 点击按钮重放；右侧为循环波形 */
export default () => {
  const [seed, setSeed] = React.useState(0);

  return (
    <Space size={48} wrap>
      <Space direction="vertical" align="center" size={12}>
        <PathDraw
          key={seed}
          paths={[
            'M 15 52 C 30 68, 42 70, 52 56 L 85 22',
          ]}
          viewBox="0 0 100 80"
          width={160}
          stroke="#0f6e56"
          strokeWidth={6}
          duration="slow"
        />
        <Button size="small" onClick={() => setSeed((s) => s + 1)}>
          重放对勾
        </Button>
      </Space>
      <PathDraw
        paths={['M 0 50 Q 12 20, 25 50 T 50 50 T 75 50 T 100 50']}
        viewBox="0 0 100 100"
        width={200}
        stroke="#534ab7"
        strokeWidth={3}
        loop
        duration={1.2}
      />
    </Space>
  );
};
