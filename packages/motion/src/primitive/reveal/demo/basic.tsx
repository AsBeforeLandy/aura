import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { Reveal } from '@aura-react-comp/motion';

const variants = [
  { v: 'fade' as const, label: 'fade · 淡入上移', bg: '#534ab7' },
  { v: 'blur' as const, label: 'blur · 对焦揭示', bg: '#0f6e56' },
  { v: 'mask' as const, label: 'mask · 遮罩升起', bg: '#185fa5' },
  { v: 'scale' as const, label: 'scale · 卡片揭示', bg: '#d4537e' },
];

/** 四种揭示形态对比；点击重放观察递增错峰节奏 */
export default () => {
  const [seed, setSeed] = useState(0);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Button size="small" onClick={() => setSeed((s) => s + 1)}>
        重放
      </Button>
      <div key={seed} style={{ display: 'grid', gap: 14 }}>
        {variants.map((item, i) => (
          <Reveal key={item.v} variant={item.v} index={i}>
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${item.bg}, ${item.bg}bb)`,
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {item.label} —— 递增错峰第 {i + 1} 位
            </div>
          </Reveal>
        ))}
      </div>
    </Space>
  );
};
