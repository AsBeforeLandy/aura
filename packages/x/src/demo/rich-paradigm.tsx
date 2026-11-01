import React from 'react';
import { message } from 'antd';
import {
  Actions,
  Bubble,
  MarkdownContent,
  Sources,
  Think,
  ThoughtChain,
  XProvider,
} from '@aura-react-comp/x';

/**
 * RICH 范式全貌：一条 assistant 消息里叠齐「思考 → 推理链 → 回答 → 来源 → 操作」。
 * 用于展示 Think / ThoughtChain / Sources / Actions 与 Bubble 的组合方式。
 */

const STEPS = [
  {
    key: 'parse',
    title: '解析问题',
    description: '识别意图：如何组织一个 AI 对话页',
    status: 'success' as const,
  },
  {
    key: 'search',
    title: '检索资料',
    description: '命中 3 条组件文档：Bubble / useXChat / RICH 范式',
    status: 'success' as const,
  },
  {
    key: 'reason',
    title: '推理归纳',
    description: '按唤醒 / 表达 / 确认 / 反馈四段归纳组件职责',
    status: 'success' as const,
  },
  {
    key: 'answer',
    title: '生成回答',
    description: '输出结构化说明与最小示例',
    status: 'success' as const,
  },
];

const SOURCES = [
  {
    key: 's-bubble',
    title: 'Bubble 对话气泡',
    url: 'https://asbeforelandy.github.io/aura/x-components/bubble',
    description: 'role 分侧、contentRender 扩展点',
  },
  {
    key: 's-chat',
    title: 'useXChat 消息编排',
    url: 'https://asbeforelandy.github.io/aura/x-components/use-x-chat',
    description: '增量更新、停止保留部分内容、多会话',
  },
  {
    key: 's-rich',
    title: 'RICH 范式',
    url: 'https://asbeforelandy.github.io/aura/x-components/',
    description: '唤醒 → 表达 → 确认 → 反馈',
  },
];

const ANSWER = `推荐的最小闭环是三个组件：

1. **\`Bubble.List\`** 渲染消息，assistant 消息走 \`contentRender\` 交给 \`MarkdownContent\`；
2. **\`Sender\`** 负责输入，\`loading\` 时按钮自动变「停止」；
3. **\`useXChat\`** 管消息编排——\`update()\` 增量写回即实现流式。

\`\`\`tsx
const { messages, loading, send, stop } = useXChat({ onRequest });
\`\`\`

> 需要思考过程时加 \`Think\` / \`ThoughtChain\`，需要引用时加 \`Sources\`，
> 消息操作放 \`Bubble\` 的 \`footer\`。`;

const pillStyle = (color: string): React.CSSProperties => ({
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: 11,
  background: color,
  color: '#fff',
});

export default () => (
  <XProvider>
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 20,
        border: '1px solid var(--aura-x-bubble-border)',
        borderRadius: 'var(--aura-radius-md)',
        background: 'var(--aura-x-stage-bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={pillStyle('#534ab7')}>确认 · Think</span>
        <span style={pillStyle('#0f6e56')}>确认 · ThoughtChain</span>
        <span style={pillStyle('#185fa5')}>反馈 · Sources</span>
        <span style={pillStyle('#993556')}>反馈 · Actions</span>
      </div>

      <Think
        duration={4}
        defaultExpanded
        content={
          <div style={{ display: 'grid', gap: 6 }}>
            <div>
              用户想知道「AI
              对话页该怎么组织组件」——这属于架构性问题，需要先给分层，再给最小闭环。
            </div>
            <div>
              组件库按 RICH
              四段组织：唤醒（Welcome/Prompts）、表达（Sender）、确认（Think/ThoughtChain）、反馈（Actions/Sources）。
            </div>
            <div>
              回答策略：先列三段最小闭环，补充可选增强，最后给一段可直接复制的代码。
            </div>
          </div>
        }
      />

      <ThoughtChain title="推理步骤（4 步）" items={STEPS} defaultExpanded />

      <Bubble
        role="assistant"
        content={ANSWER}
        contentRender={(content: string) => (
          <MarkdownContent>{content}</MarkdownContent>
        )}
        footer={
          <Actions
            ariaLabel="消息操作"
            items={[
              {
                key: 'copy',
                label: '复制',
                onClick: () => message.success('已复制回答'),
              },
              {
                key: 'regen',
                label: '重新生成',
                onClick: () => message.info('已触发生成（演示）'),
              },
              {
                key: 'like',
                label: '有帮助',
                onClick: () => message.success('感谢反馈'),
              },
              {
                key: 'del',
                label: '删除',
                danger: true,
                onClick: () => message.warning('已删除（演示）'),
              },
            ]}
          />
        }
      />

      <Sources title="已引用 3 个来源" items={SOURCES} defaultExpanded />
    </div>
  </XProvider>
);
