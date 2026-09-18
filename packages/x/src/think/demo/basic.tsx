import React from 'react';
import { Think } from '@aura/x';

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
    <Think
      thinking
      content={'用户想了解流式渲染…\n先拆解问题，再给出实现建议…'}
    />
    <Think content={'1. 确认协议（SSE / 纯文本）\n2. 选择组件\n3. 输出示例'} duration={4} />
    <Think content="这是个简单问候，直接回复即可。" duration={1} />
  </div>
);
