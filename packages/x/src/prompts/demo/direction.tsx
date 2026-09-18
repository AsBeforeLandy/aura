import React from 'react';
import { Prompts } from '@aura/x';

export default () => (
  <div style={{ maxWidth: 720 }}>
    <Prompts
      direction="horizontal"
      title="横向排列（适合工具入口）"
      items={[
        { key: 'a', label: '生成图表', description: '从表格数据生成', icon: '📊' },
        { key: 'b', label: '润色文案', description: '正式 / 口语化', icon: '✍️' },
        { key: 'c', label: '翻译', description: '中英互译', icon: '🌐' },
      ]}
    />
    <div style={{ height: 16 }} />
    <Prompts
      direction="vertical"
      title="纵向排列（适合对话引导）"
      items={[
        { key: 'd', label: '解释这段代码的作用' },
        { key: 'e', label: '帮我写一封周报邮件' },
      ]}
    />
  </div>
);
