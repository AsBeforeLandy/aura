import React from 'react';
import { Prompts, Welcome } from '@aura/x';

export default () => {
  const [picked, setPicked] = React.useState<React.ReactNode>('');

  return (
    <div style={{ maxWidth: 560 }}>
      <Welcome
        icon="👋"
        title="早上好，Landy"
        description="我是 Aura 的 AI 助手，今天想从哪里开始？"
        extra={
          <Prompts
            items={[
              { key: 'p1', label: '总结这份文档', description: '提炼要点与结论' },
              { key: 'p2', label: '审查这段代码', description: '指出潜在缺陷' },
            ]}
            onItemClick={(item) => setPicked(item.label)}
          />
        }
      />
      {picked ? (
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--aura-text-secondary)' }}>
          已选择：{picked}
        </p>
      ) : null}
    </div>
  );
};
