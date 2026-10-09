import React, { useEffect, useState } from 'react';
import {
  Bubble,
  Conversations,
  MarkdownContent,
  Prompts,
  Sender,
  Welcome,
  useXChat,
} from '@aura-react-comp/x';
import type {
  BubbleListItem,
  ConversationItem,
  ConversationMenuConfig,
  PromptItem,
  XMessage,
} from '@aura-react-comp/x';

/* ============ 模拟远端会话存储 ============ */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (messages: XMessage[]): XMessage[] =>
  messages.map((message) => ({ ...message }));

let keySeq = 0;
const nextKey = () => `conv-${++keySeq}`;

/** 模拟服务端：异步读、同步写。真实场景换成你的接口即可 */
const server: {
  data: Record<string, XMessage[]>;
  load: (key: string) => Promise<XMessage[]>;
  save: (key: string, messages: XMessage[]) => void;
} = {
  data: {
    'seed-a': [
      { id: 'a-1', role: 'user', content: 'AI 组件库一般按什么阶段划分？' },
      {
        id: 'a-2',
        role: 'assistant',
        content:
          '按 **RICH** 范式分四段：\n\n1. **唤醒** — Welcome / Prompts\n2. **表达** — Sender / Attachments\n3. **确认** — Think / ThoughtChain\n4. **反馈** — Actions / Sources\n\n段落划分让「组件该放哪」有据可依。',
        status: 'success',
      },
    ],
    'seed-b': [
      { id: 'b-1', role: 'user', content: '多会话切换要注意什么？' },
      {
        id: 'b-2',
        role: 'assistant',
        content:
          '两件事最关键：\n\n- **消息归属**：切换后写回存储时必须确认这份消息属于哪个会话；\n- **在途请求**：切换会中止旧请求，且旧请求的收尾不能污染新会话的 `loading` 态。\n\n`useXChat` 的 `conversationKey` 就是为这两件事准备的。',
        status: 'success',
      },
    ],
    'seed-c': [],
  },
  async load(key) {
    await sleep(160);
    return clone(server.data[key] ?? []);
  },
  save(key, messages) {
    server.data[key] = clone(messages);
  },
};

/* ============ 初始状态 ============ */

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  { key: 'seed-a', label: '组件库交互阶段', timestamp: '09:12' },
  { key: 'seed-b', label: '多会话切换怎么做', timestamp: '08:40' },
  { key: 'seed-c', label: '新会话', timestamp: '刚刚' },
];

const PROMPTS: PromptItem[] = [
  { key: 'p1', label: '帮我梳理组件的交互阶段' },
  { key: 'p2', label: '多会话切换要注意什么？' },
  { key: 'p3', label: '怎么把流式回复接进气泡？' },
];

/** 按提问生成一段 Markdown 回复（真实场景来自模型） */
const buildReply = (message: string) =>
  `已收到你的问题：**${message}**\n\n这是当前会话独立的上下文，切换会话不会串。\n\n\`\`\`tsx\nconst { messages, send } = useXChat({\n  conversationKey: activeKey,\n  defaultMessages: ({ conversationKey }) => loadHistory(conversationKey),\n});\n\`\`\`\n\n点击「停止」可以保留已经生成的部分。`;

export default () => {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeKey, setActiveKey] = useState('seed-a');
  /**
   * 当前 `messages` 属于哪个会话。
   * 只有它等于 `activeKey` 时才允许写回存储——否则切会话的瞬间会把
   * 上一个会话的消息误写进新会话。
   */
  const [ownerKey, setOwnerKey] = useState<string | null>(null);
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const { messages, loading, isDefaultMessagesRequesting, send, stop } = useXChat({
    conversationKey: activeKey,
    defaultMessages: async ({ conversationKey }) => {
      const key = String(conversationKey);
      const history = await server.load(key);
      setOwnerKey(key); // 标记归属，写回才有依据
      return history;
    },
    onRequest: async ({ message, signal, update }) => {
      let acc = '';
      for (const char of buildReply(message)) {
        if (signal.aborted) throw signal.reason;
        acc += char;
        update({ content: acc });
        await sleep(18);
      }
    },
  });

  // 写回存储：只在消息确实属于当前会话时落盘
  useEffect(() => {
    if (ownerKey === null || ownerKey !== activeKey) return;
    server.save(activeKey, messages);
  }, [messages, ownerKey, activeKey]);

  const handleSend = (text: string) => {
    // 首次提问的会话用问题前 12 字自动命名
    if (messages.length === 0) {
      const label = text.length > 12 ? `${text.slice(0, 12)}…` : text;
      setConversations((prev) =>
        prev.map((item) =>
          String(item.key) === activeKey ? { ...item, label } : item,
        ),
      );
    }
    send(text);
  };

  const createConversation = () => {
    const key = nextKey();
    server.data[key] = [];
    setConversations((prev) => [
      { key, label: '新会话', timestamp: '刚刚' },
      ...prev,
    ]);
    setActiveKey(key);
  };

  const removeConversation = (key: string) => {
    delete server.data[key];
    const remaining = conversations.filter((item) => String(item.key) !== key);

    // 删的不是当前会话：列表更新即可
    if (key !== activeKey) {
      setConversations(remaining);
      return;
    }
    if (remaining.length > 0) {
      setConversations(remaining);
      setActiveKey(String(remaining[0].key));
      return;
    }
    // 删掉最后一个：补一个空会话，保证「至少有一个会话」的闭环不落空
    const freshKey = nextKey();
    server.data[freshKey] = [];
    setConversations([{ key: freshKey, label: '新会话', timestamp: '刚刚' }]);
    setActiveKey(freshKey);
  };

  const startRename = (key: string, current: React.ReactNode) => {
    setRenamingKey(key);
    setRenameDraft(typeof current === 'string' ? current : '');
  };

  const commitRename = () => {
    if (renamingKey === null) return;
    const next = renameDraft.trim();
    if (next) {
      setConversations((prev) =>
        prev.map((item) =>
          String(item.key) === renamingKey ? { ...item, label: next } : item,
        ),
      );
    }
    setRenamingKey(null);
  };

  const menuFor = (item: ConversationItem): ConversationMenuConfig => ({
    items: [
      { key: 'rename', label: '重命名' },
      { key: 'delete', label: '删除', danger: true },
    ],
    onClick: (target, menuKey) => {
      const key = String(target.key);
      if (menuKey === 'rename') startRename(key, target.label);
      else removeConversation(key);
    },
  });

  const bubbleItems: BubbleListItem[] = messages.map((message) => ({
    key: message.id,
    role: message.role,
    content: message.content,
    // 只有「还没有任何内容」的占位才显示三点打字动画
    loading: message.status === 'loading' && !message.content,
    contentRender:
      message.role === 'assistant'
        ? (content: string) => <MarkdownContent>{content}</MarkdownContent>
        : undefined,
  }));

  const showWelcome = messages.length === 0 && !isDefaultMessagesRequesting;

  return (
    <div style={{ display: 'flex', gap: 16, maxWidth: 880, alignItems: 'flex-start' }}>
      {/* ===== 左：会话列表 ===== */}
      <div
        style={{
          display: 'flex',
          flex: 'none',
          flexDirection: 'column',
          gap: 8,
          width: 232,
        }}
      >
        <button
          type="button"
          onClick={createConversation}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--aura-border)',
            borderRadius: 'var(--aura-radius-sm)',
            background: 'transparent',
            color: 'var(--aura-text)',
            fontSize: 'var(--aura-font-size-sm)',
            cursor: 'pointer',
          }}
        >
          ＋ 新建会话
        </button>

        {renamingKey !== null ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              autoFocus
              value={renameDraft}
              aria-label="会话名称"
              onChange={(event) => setRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitRename();
                if (event.key === 'Escape') setRenamingKey(null);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '4px 8px',
                border: '1px solid var(--aura-x-bubble-border)',
                borderRadius: 'var(--aura-radius-sm)',
                background: 'transparent',
                color: 'var(--aura-text)',
                fontSize: 'var(--aura-font-size-sm)',
              }}
            />
            <button type="button" onClick={commitRename} style={{ cursor: 'pointer' }}>
              确定
            </button>
          </div>
        ) : null}

        <Conversations
          items={conversations}
          activeKey={activeKey}
          onActiveChange={(key) => setActiveKey(String(key))}
          menu={menuFor}
        />
      </div>

      {/* ===== 右：消息 + 输入 ===== */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          gap: 12,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 320,
            padding: 12,
            border: '1px solid var(--aura-x-bubble-border)',
            borderRadius: 'var(--aura-radius-md)',
            background: 'var(--aura-x-stage-bg)',
          }}
        >
          {showWelcome ? (
            <Welcome
              variant="simple"
              title="开始一个新的对话"
              description="换个话题，或从下面的提示词开始"
              extra={
                <Prompts
                  items={PROMPTS}
                  onItemClick={(item) => handleSend(String(item.label))}
                />
              }
            />
          ) : isDefaultMessagesRequesting ? (
            <span
              style={{
                color: 'var(--aura-text-secondary)',
                fontSize: 'var(--aura-font-size-sm)',
              }}
            >
              正在加载会话历史…
            </span>
          ) : (
            <Bubble.List
              items={bubbleItems}
              style={{ width: '100%', maxHeight: 320 }}
            />
          )}
        </div>

        <Sender
          loading={loading}
          onSubmit={handleSend}
          onCancel={stop}
          placeholder="在当前会话里提问，Enter 发送…"
          footer={
            <span style={{ marginLeft: 'auto' }}>
              {messages.length} 条消息 · {conversations.length} 个会话
            </span>
          }
        />
      </div>
    </div>
  );
};
