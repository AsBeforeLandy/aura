import React, { useEffect, useRef } from 'react';
import { Bubble, MarkdownContent, Sender, useXChat } from '@aura/x';

/** 预置回复：演示流式逐字输出 */
const REPLIES = [
  '你好！我是 Aura 的 AI 助手。\n\n- 支持**流式输出**\n- 支持 `代码块`\n- 可随时点击「停止」',
  '这条回复用于演示流式渲染：内容逐字出现，完成后状态收敛为 success。',
  '换一种回复试试——输入任意内容，长度会决定取到哪一条预置回复。',
];

export default () => {
  const startedRef = useRef(false);
  const { messages, loading, send, stop } = useXChat({
    onRequest: async ({ message, signal, update }) => {
      // mock：按输入长度挑一条预置回复，逐字吐出（真实场景替换为 useXStream）
      const reply = REPLIES[message.length % REPLIES.length];
      let acc = '';
      for (const char of reply) {
        if (signal.aborted) throw signal.reason;
        acc += char;
        update({ content: acc });
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
    },
  });

  // 进入示例即自动发起一轮对话，直观展示流式打字效果
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      send('你好');
    }
  }, [send]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
      <Bubble.List
        items={messages.map((message) => ({
          key: message.id,
          role: message.role,
          content: message.content,
          loading: message.status === 'loading' && !message.content,
          contentRender:
            message.role === 'assistant' ? (content) => <MarkdownContent>{content}</MarkdownContent> : undefined,
        }))}
        style={{ maxHeight: 320, padding: 12 }}
      />
      <Sender loading={loading} onSubmit={send} onCancel={stop} />
    </div>
  );
};
