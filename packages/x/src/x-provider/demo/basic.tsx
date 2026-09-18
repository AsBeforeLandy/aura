import React, { useEffect, useRef, useState } from 'react';
import { Bubble, MarkdownContent, Sender, useXChat, XProvider } from '@aura/x';

const COLORS = [
  { label: '紫罗兰', value: '#7c3aed' },
  { label: '海洋蓝', value: '#2563eb' },
  { label: '翡翠绿', value: '#059669' },
  { label: '珊瑚橙', value: '#ea580c' },
];

const GREETING = '你好！我是 **Aura AI 助手**。\n\n试试右上角的色板与暗色开关——组件视觉会即时跟随。';

export default () => {
  const [color, setColor] = useState(COLORS[0].value);
  const [dark, setDark] = useState(false);

  const { messages, loading, send, stop } = useXChat({
    onRequest: async ({ message, signal, update }) => {
      let acc = '';
      const reply = `已收到「${message}」。当前主题：${color} · ${dark ? '暗色' : '亮色'}。`;
      for (const char of reply) {
        if (signal.aborted) throw signal.reason;
        acc += char;
        update({ content: acc });
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
    },
  });

  // 进入示例自动演示一轮
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const timer = setTimeout(() => send('你好'), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* 色板 + 暗色开关 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={color === c.value}
            onClick={() => setColor(c.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 13,
              border: `1px solid ${color === c.value ? c.value : 'var(--aura-x-bubble-border)'}`,
              background: color === c.value ? 'var(--aura-x-accent-soft)' : 'transparent',
              color: 'var(--aura-text)',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.value }} />
            {c.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={dark}
          onClick={() => setDark((v) => !v)}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: 13,
            border: '1px solid var(--aura-x-bubble-border)',
            background: dark ? 'var(--aura-x-accent-soft)' : 'transparent',
            color: 'var(--aura-text)',
          }}
        >
          {dark ? '☀️ 切换亮色' : '🌙 切换暗色'}
        </button>
      </div>

      {/* 主题作用域内的对话预览：色板 / 暗色开关即时生效 */}
      <XProvider colorPrimary={color} dark={dark}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
            borderRadius: 14,
            border: '1px solid var(--aura-x-bubble-border)',
            background: 'var(--aura-x-stage-bg)',
            transition: 'background 0.3s',
          }}
        >
          <Bubble role="assistant" content={GREETING} contentRender={(c) => <MarkdownContent>{c}</MarkdownContent>} />
          <Bubble.List
            items={messages.map((message) => ({
              key: message.id,
              role: message.role,
              content: message.content,
              loading: message.status === 'loading' && !message.content,
              contentRender:
                message.role === 'assistant'
                  ? (content) => <MarkdownContent>{content}</MarkdownContent>
                  : undefined,
            }))}
            style={{ maxHeight: 280 }}
          />
          <Sender loading={loading} onSubmit={send} onCancel={stop} placeholder="向 AI 发送消息…" />
        </div>
      </XProvider>
    </div>
  );
};
