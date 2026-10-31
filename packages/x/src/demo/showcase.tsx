import React from 'react';
import {
  Bubble,
  MarkdownContent,
  Prompts,
  Sender,
  Welcome,
  useXChat,
  XProvider,
} from '@aura-react-comp/x';

/**
 * 完整对话页演示墙：空态引导（Welcome + Prompts）→ 提问 → 逐字流式回复
 * → Markdown 渲染。回复为前端模拟（无 API Key），用于直接体验组件协作。
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PROMPTS = [
  { key: 'layout', label: '这套组件怎么组织对话页？' },
  { key: 'stream', label: '流式输出怎么接后端？' },
  { key: 'sessions', label: '如何做多会话切换？' },
];

function buildReply(question: string): string {
  return `已收到你的问题：**${question}**

Aura 的 AI 组件按 **RICH** 范式分层，每一层都有对应组件：

| 阶段 | 组件 |
| --- | --- |
| 唤醒 | \`Welcome\` / \`Prompts\` |
| 表达 | \`Sender\` / \`Attachments\` |
| 确认 | \`Think\` / \`ThoughtChain\` |
| 反馈 | \`Actions\` / \`Sources\` |

最小闭环只需要三个：

\`\`\`tsx
const { messages, loading, send, stop } = useXChat({
  onRequest: async ({ message, signal, update }) => {
    let acc = '';
    for await (const chunk of stream(message, signal)) {
      acc += chunk;
      update({ content: acc }); // 逐字写回
    }
  },
});
\`\`\`

> 上面这段回复就是逐字流式写入的——你现在看到的每个字都是 \`update\` 的结果。`;
}

export default () => {
  const { messages, loading, send, stop } = useXChat({
    onRequest: async ({ message, signal, update }) => {
      let acc = '';
      for (const char of buildReply(message)) {
        if (signal.aborted) throw signal.reason;
        acc += char;
        update({ content: acc });
        await sleep(12);
      }
    },
  });

  const items = messages.map((message) => ({
    key: message.id,
    role: message.role,
    content: message.content,
    loading: message.status === 'loading' && !message.content,
    contentRender:
      message.role === 'assistant'
        ? (content: string) => <MarkdownContent>{content}</MarkdownContent>
        : undefined,
  }));

  return (
    <XProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 360,
            padding: 16,
            border: '1px solid var(--aura-x-bubble-border)',
            borderRadius: 'var(--aura-radius-md)',
            background: 'var(--aura-x-stage-bg)',
          }}
        >
          {messages.length === 0 ? (
            <Welcome
              variant="simple"
              title="开始一段对话"
              description="提问、粘贴需求，或从下面的提示词开始（回复为前端模拟流式）"
              extra={
                <Prompts
                  items={PROMPTS}
                  onItemClick={(item) => send(String(item.label))}
                />
              }
            />
          ) : (
            <Bubble.List
              items={items}
              style={{ width: '100%', maxHeight: 360 }}
            />
          )}
        </div>

        <Sender
          loading={loading}
          onSubmit={send}
          onCancel={stop}
          placeholder="输入问题，Enter 发送，Shift+Enter 换行…"
          footer={
            <span style={{ marginLeft: 'auto' }}>
              {messages.length} 条消息 · 模拟流式回复
            </span>
          }
        />
      </div>
    </XProvider>
  );
};
