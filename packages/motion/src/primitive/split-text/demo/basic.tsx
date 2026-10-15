import React from 'react';
import { Space } from 'antd';
import { SplitText } from '@aura-react-comp/motion';

/** 三种入场形态对比（char 粒度） */
export default () => (
  <Space direction="vertical" size={28} style={{ width: '100%' }}>
    <div>
      <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 8 }}>variant="fade"</div>
      <SplitText
        text="令牌驱动的动效组件库"
        granularity="char"
        variant="fade"
        style={{ fontSize: 24, fontWeight: 600 }}
      />
    </div>
    <div>
      <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 8 }}>
        variant="rise" —— 每字从遮罩下方升起
      </div>
      <SplitText
        text="文字从遮罩里升起"
        granularity="char"
        variant="rise"
        stagger={0.045}
        style={{ fontSize: 24, fontWeight: 600 }}
      />
    </div>
    <div>
      <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 8 }}>
        variant="flip" —— rotateX 翻牌入场
      </div>
      <SplitText
        text="MOTION IN 2026"
        granularity="char"
        variant="flip"
        stagger={0.05}
        style={{ fontSize: 24, fontWeight: 600, letterSpacing: 2 }}
      />
    </div>
  </Space>
);
