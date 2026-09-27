import React, { useState } from 'react';
import { useXChat } from '@aura/x';
import type { XMessage } from '@aura/x';

/** 模拟远端：按会话返回历史（异步），体现 conversationKey 的初始化语义 */
const remote: Record<string, XMessage[]> = {
  alpha: [
    { id: 'a1', role: 'user', content: 'Alpha 会话的历史提问' },
    { id: 'a2', role: 'assistant', content: 'Alpha 会话的历史回答', status: 'success' },
  ],
  beta: [{ id: 'b1', role: 'assistant', content: 'Beta 会话只有一句问候', status: 'success' }],
};

const loadHistory = async (key: string): Promise<XMessage[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return (remote[key] ?? []).map((message) => ({ ...message }));
};

export default () => {
  const [key, setKey] = useState('alpha');

  const {
    messages,
    loading,
    isDefaultMessagesRequesting,
    send,
    stop,
    setMessages,
  } = useXChat({
    conversationKey: key,
    defaultMessages: ({ conversationKey }) =>
      loadHistory(String(conversationKey)),
    onRequest: async ({ message, signal, update }) => {
      let acc = '';
      for (const char of `（${key}）收到：${message}`) {
        if (signal.aborted) throw signal.reason;
        acc += char;
        update({ content: acc });
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {['alpha', 'beta'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKey(item)}
            aria-pressed={key === item}
            style={{
              padding: '6px 14px',
              border: '1px solid var(--aura-x-bubble-border)',
              borderRadius: 'var(--aura-radius-sm)',
              background: key === item ? 'var(--aura-x-accent-soft)' : 'transparent',
              color: key === item ? 'var(--aura-x-accent)' : 'var(--aura-text)',
              fontSize: 'var(--aura-font-size-sm)',
              cursor: 'pointer',
            }}
          >
            切换会话 {item}
          </button>
        ))}
        <span style={{ fontSize: 'var(--aura-font-size-xs)', color: 'var(--aura-text-tertiary)' }}>
          {isDefaultMessagesRequesting ? '加载历史中…' : `共 ${messages.length} 条`}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--aura-x-bubble-border)',
              borderRadius: 'var(--aura-radius-sm)',
              fontSize: 'var(--aura-font-size-sm)',
            }}
          >
            <span style={{ color: 'var(--aura-x-accent)' }}>{message.role}</span>
            {message.status ? (
              <span style={{ color: 'var(--aura-text-tertiary)' }}> · {message.status}</span>
            ) : null}
            <div>{message.content || '…'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" disabled={loading} onClick={() => send('这条属于当前会话')}>
          发送
        </button>
        <button type="button" disabled={!loading} onClick={stop}>
          停止
        </button>
        <button
          type="button"
          onClick={() =>
            setMessages([
              { id: 'injected', role: 'assistant', content: 'setMessages 直接替换，不触发请求' },
            ])
          }
        >
          setMessages 替换
        </button>
      </div>
    </div>
  );
};
