import React from 'react';
import { Space } from 'antd';
import { SplitText } from '@aura-react-comp/motion';

/** 三种粒度：char / word / line */
export default () => (
  <Space direction="vertical" size={28} style={{ width: '100%' }}>
    <div>
      <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 8 }}>granularity="char"</div>
      <SplitText
        text="令牌驱动的动效组件库"
        granularity="char"
        stagger={0.05}
        style={{ fontSize: 26, fontWeight: 600 }}
      />
    </div>
    <div>
      <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 8 }}>granularity="word"</div>
      <SplitText
        text="Motion tokens for every interface"
        granularity="word"
        stagger={0.08}
        style={{ fontSize: 20, fontWeight: 500 }}
      />
    </div>
    <div>
      <div style={{ color: '#5f5e5a', fontSize: 12, marginBottom: 8 }}>
        granularity="line" + mode="inView"（向下滚动触发）
      </div>
      <SplitText
        text={'第一行：进入视口时揭示\n第二行：支持换行拆分\n第三行：once 播放一次'}
        granularity="line"
        stagger={0.18}
        mode="inView"
        style={{ fontSize: 16 }}
      />
    </div>
  </Space>
);
