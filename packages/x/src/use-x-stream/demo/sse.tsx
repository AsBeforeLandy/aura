import React, { useState } from 'react';
import { useXStream } from '@aura/x';

/**
 * 模拟一条 SSE 响应（真实场景这段由服务端返回）。
 * Blob URL + fetch 可以在纯浏览器环境完整演示 SSE 解析。
 */
const SSE_TEXT = [
  'data: {"delta":"收到！"}',
  '',
  'data: {"delta":"这是一个"}',
  '',
  'data: {"delta":"**SSE 流式**"}',
  '',
  'data: {"delta":"响应。"}',
  '',
  'data: {"delta":"\\n\\n`[DONE]` 哨兵由消费方过滤。"}',
  '',
  'data: [DONE]',
  '',
].join('\n');

export default () => {
  const { fetchData, abort, streaming } = useXStream();
  const [output, setOutput] = useState('');
  const [rawCount, setRawCount] = useState(0);

  const run = () => {
    setOutput('');
    setRawCount(0);
    const url = URL.createObjectURL(new Blob([SSE_TEXT], { type: 'text/event-stream' }));
    void fetchData({
      url,
      onMessage: (chunk) => {
        setRawCount((n) => n + 1);
        if (chunk.data === '[DONE]') return; // 结束哨兵：消费方过滤
        try {
          setOutput((prev) => prev + (JSON.parse(chunk.data).delta ?? ''));
        } catch {
          setOutput((prev) => prev + chunk.data);
        }
      },
    });
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 620 }}>
      <button
        type="button"
        onClick={run}
        disabled={streaming}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 16px',
          borderRadius: 999,
          border: '1px solid var(--aura-x-bubble-border)',
          background: 'var(--aura-x-accent-gradient)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {streaming ? '接收中…' : '发起 SSE 请求'}
      </button>
      <div
        style={{
          minHeight: 72,
          padding: 12,
          border: '1px solid var(--aura-x-bubble-border)',
          borderRadius: 12,
          background: 'var(--aura-x-stage-bg)',
          whiteSpace: 'pre-wrap',
          fontSize: 14,
        }}
      >
        {output || '（点击上方按钮，观察消息逐条到达）'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--aura-text-tertiary)' }}>
        共收到 {rawCount} 条消息（[DONE] 哨兵不计入内容）
      </div>
    </div>
  );
};
