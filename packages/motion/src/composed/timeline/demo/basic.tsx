import React from 'react';
import { Timeline } from '@aura-react-comp/motion';

const steps = [
  { at: 0, title: '收到请求', desc: '用户提交表单' },
  { at: 0.4, title: '参数校验', desc: '服务端二次校验通过' },
  { at: 0.8, title: '生成报告', desc: '调用模型完成摘要' },
  { at: 1.2, title: '已送达', desc: '邮件与站内信双通道送达' },
];

/** Timeline.Step 按 at 时刻依次揭示（进入视口自动播放） */
export default () => (
  <Timeline style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
    {steps.map((s) => (
      <Timeline.Step key={s.title} at={s.at}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: '#534ab7',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{s.title}</div>
            <div style={{ color: '#5f5e5a', fontSize: 13 }}>{s.desc}</div>
          </div>
        </div>
      </Timeline.Step>
    ))}
  </Timeline>
);
