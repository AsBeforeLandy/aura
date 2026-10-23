import React from 'react';
import { PageContainer } from '@aura-react-comp/business';
import { NumberTicker, Reveal, SplitText } from '@aura-react-comp/motion';

const metrics = [
  { label: '今日请求量', value: 128940, suffix: '次' },
  { label: '活跃用户', value: 3286, suffix: '人' },
  { label: '平均响应', value: 218, suffix: 'ms' },
];

/** 动效增强：标题遮罩升起 + 指标数字滚动 + 卡片错峰进场 */
export default () => (
  <PageContainer
    title={
      <SplitText
        text="运营概览"
        granularity="char"
        variant="rise"
        stagger={0.05}
        style={{ fontSize: 20 }}
      />
    }
    description="标题从遮罩升起，指标数字逐位滚动，卡片递增错峰"
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {metrics.map((m, i) => (
        <Reveal key={m.label} index={i} variant={i === 1 ? 'blur' : 'fade'}>
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: '1px solid #e8e6de',
              background: '#faf9f5',
            }}
          >
            <div style={{ fontSize: 12, color: '#8a8984', marginBottom: 8 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <NumberTicker value={m.value} style={{ fontSize: 28, fontWeight: 600 }} />
              <span style={{ fontSize: 12, color: '#8a8984' }}>{m.suffix}</span>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </PageContainer>
);
