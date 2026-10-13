import React, { useState } from 'react';
import { Button, Space, Switch } from 'antd';
import { Slide } from '@aura-react-comp/motion';

/** 保留式：DOM 常驻，visible 切换动画 */
export default () => {
  const [open, setOpen] = useState(true);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space wrap>
        <Switch checked={open} onChange={setOpen} checkedChildren="显示" unCheckedChildren="隐藏" />
        {(['up', 'down', 'left', 'right'] as const).map((d) => (
          <Button
            key={d}
            size="small"
            type={direction === d ? 'primary' : 'default'}
            onClick={() => setDirection(d)}
          >
            {d}
          </Button>
        ))}
      </Space>
      <Slide visible={open} direction={direction} distance="md">
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #534ab7, #7f77dd)',
            color: '#fff',
            fontWeight: 500,
          }}
        >
          位移方向：{direction} —— 全部时长与缓动来自动效令牌
        </div>
      </Slide>
    </Space>
  );
};
