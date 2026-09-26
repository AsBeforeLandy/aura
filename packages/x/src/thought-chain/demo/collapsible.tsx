import React, { useEffect, useState } from 'react';
import { ThoughtChain } from '@aura/x';
import type { ThoughtChainItem, ThoughtChainStatus } from '@aura/x';

const STEPS = [
  { key: 'retrieve', title: '检索知识库', description: '匹配到 3 篇相关文档' },
  { key: 'analyze', title: '分析组件差距', description: '比对 antdx 官方组件清单' },
  { key: 'generate', title: '生成改进结论', description: '输出 5 项待补组件' },
];

const STEP_INTERVAL = 900;

export default () => {
  // -1 表示未开始；0..STEPS.length 表示执行进度（等于 length 即全部完成）
  const [cursor, setCursor] = useState(-1);

  // 每 900ms 推进一步，直到全部完成
  useEffect(() => {
    if (cursor < 0 || cursor >= STEPS.length) return undefined;
    const timer = window.setTimeout(() => setCursor((prev) => prev + 1), STEP_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [cursor]);

  const running = cursor >= 0 && cursor < STEPS.length;

  const statusOf = (index: number): ThoughtChainStatus => {
    if (index < cursor) return 'success';
    if (index === cursor) return 'thinking';
    return 'pending';
  };

  const items: ThoughtChainItem[] = STEPS.map((step, index) => ({
    key: step.key,
    title: step.title,
    description: index < cursor ? step.description : undefined,
    status: statusOf(index),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      <button
        type="button"
        disabled={running}
        onClick={() => setCursor(0)}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 14px',
          border: '1px solid var(--aura-border)',
          borderRadius: 'var(--aura-radius-sm)',
          background: 'transparent',
          color: 'var(--aura-text)',
          fontSize: 'var(--aura-font-size-sm)',
          cursor: running ? 'default' : 'pointer',
        }}
      >
        {running ? '推理中…' : cursor >= STEPS.length ? '重新推理' : '开始推理'}
      </button>
      <ThoughtChain items={items} />
      <p style={{ fontSize: 'var(--aura-font-size-xs)', color: 'var(--aura-text-secondary)' }}>
        有步骤处于 <code>thinking</code> 时链路强制展开，头部不可点击；全部完成后自动收起，
        此时点击头部可回看完整链路。
      </p>
    </div>
  );
};
