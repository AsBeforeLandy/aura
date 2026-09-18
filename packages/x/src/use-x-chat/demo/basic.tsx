import React, { useState } from 'react';
import { useXChat, type XMessage } from '@aura/x';

/** mock 传输：逐字吐出，模拟流式响应（真实场景替换为 fetch / useXStream） */
async function mockRequest(
  reply: string,
  signal: AbortSignal,
  onDelta: (delta: string) => void,
) {
  let acc = '';
  for (const char of reply) {
    if (signal.aborted) throw signal.reason;
    acc += char;
    onDelta(acc);
    await new Promise((resolve) => setTimeout(resolve, 24));
  }
}

export default () => {
  const [lastReply, setLastReply] = useState('');

  const { messages, loading, send, stop, clear } = useXChat({
    onRequest: async ({ message, signal, update }) => {
      const reply = `已收到「${message}」。这条回复由 onRequest 逐字写入 assistant 占位，点击「停止」可保留部分内容。`;
      setLastReply(reply);
      await mockRequest(reply, signal, (content) => update({ content }));
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
      {/* 消息状态可视化：id / role / status / content 全部来自 useXChat */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {messages.map((m: XMessage) => (
          <div key={m.id} style={{ padding: '6px 10px', border: '1px solid var(--aura-x-bubble-border)', borderRadius: 8 }}>
            <span style={{ color: 'var(--aura-x-accent)', fontWeight: 500 }}>{m.role}</span>
            {m.status ? (
              <span style={{ color: 'var(--aura-text-tertiary)' }}> · {m.status}</span>
            ) : null}
            <div>{m.content || '…'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => send('介绍一下 useXChat')}
          style={{ padding: '6px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          发送
        </button>
        <button type="button" disabled={!loading} onClick={stop} style={{ padding: '6px 16px' }}>
          停止
        </button>
        <button type="button" onClick={clear} style={{ padding: '6px 16px' }}>
          清空
        </button>
      </div>
      {lastReply ? (
        <div style={{ fontSize: 12, color: 'var(--aura-text-tertiary)' }}>
          最新回复长度：{lastReply.length} 字符（UI 渲染仅作示意，完整气泡见 Bubble 示例）
        </div>
      ) : null}
    </div>
  );
};
