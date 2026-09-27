import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '../use-x-stream';

/** 一条对话消息 */
export interface XMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** assistant 消息的生成状态；user / system 消息不设置 */
  status?: 'loading' | 'success' | 'error';
}

/** onRequest 收到的上下文 */
export interface XChatRequestContext {
  /** 本轮用户输入 */
  message: string;
  /** 完整消息列表（已包含本轮 user 消息与 assistant 占位），可直接作为请求上下文 */
  messages: XMessage[];
  /** 中止信号——onRequest 必须尊重它（传给 fetch / 在读流时检查），否则 stop() 无法生效 */
  signal: AbortSignal;
  /**
   * 增量更新 assistant 占位消息。
   * 只合并 content / status 两个字段，不会影响其他消息。
   */
  update: (patch: Partial<Pick<XMessage, 'content' | 'status'>>) => void;
}

/** 默认消息的来源：定长数组，或按会话动态求值（可异步，用于拉取历史） */
export type XChatDefaultMessages =
  | XMessage[]
  | ((info: {
      conversationKey?: string | number;
    }) => XMessage[] | Promise<XMessage[]>);

export interface UseXChatOptions {
  /**
   * 会话唯一标识。**变化时会按 `defaultMessages` 重新初始化消息列表**，
   * 并中止上一个会话进行中的请求——这是多会话切换的关键。
   */
  conversationKey?: string | number;
  /**
   * 默认消息（进入某个会话时展示的内容）：
   * - 数组：直接使用；
   * - 函数：`({ conversationKey }) => XMessage[] | Promise<XMessage[]>`，
   *   可异步拉取历史；此时 `isDefaultMessagesRequesting` 会反映加载态。
   *
   * 只在**挂载**与 **`conversationKey` 变化**时求值，因此传数组字面量也不会
   * 每次渲染都重置消息。
   */
  defaultMessages?: XChatDefaultMessages;
  /**
   * 数组形态的默认消息简写。
   * @deprecated 建议改用 `defaultMessages`；两者同时存在时以 `defaultMessages` 为准。
   */
  initialMessages?: XMessage[];
  /**
   * 发起一次 AI 请求。内部已持有 AbortController：请把 `context.signal` 传给
   * 底层 fetch；请求抛错视为失败（写入 error 态并回调 onError），
   * 因 abort 被打断视为正常结束（保留已生成的部分内容）。
   */
  onRequest: (context: XChatRequestContext) => Promise<void>;
  /** 请求失败回调（abort 不触发） */
  onError?: (error: Error) => void;
}

export interface UseXChatResult {
  messages: XMessage[];
  /** 是否有进行中的请求 */
  loading: boolean;
  /** `defaultMessages` 为异步函数时，历史消息是否仍在加载 */
  isDefaultMessagesRequesting: boolean;
  /**
   * 发送一条用户消息：追加 user 消息与 assistant 占位（loading 态）后调用 onRequest。
   * loading 期间或内容为空白时忽略。
   */
  send(content: string): void;
  /** 中止当前请求（保留 assistant 已生成的部分内容） */
  stop(): void;
  /** 中止当前请求并清空消息，回到最近一次解析出的默认消息 */
  clear(): void;
  /**
   * 直接替换消息列表。**不触发请求**——多会话切换时用它把某个会话的消息写回来。
   */
  setMessages(messages: XMessage[]): void;
}

const cloneMessages = (messages: XMessage[]): XMessage[] =>
  messages.map((message) => ({ ...message }));

/**
 * useXChat — 对话消息编排 Hook（与传输层 useXStream 正交）。
 *
 * 职责：维护消息列表状态机（user / assistant 成对追加、loading 态、
 * 增量更新、错误态、中止与清空），并按 `conversationKey` 管理多会话切换。
 * **不做传输**——怎么请求由 `onRequest` 决定，典型组合是内部调用
 * `useXStream().fetchData` 并在 onMessage 里 `update` 内容。
 */
export function useXChat({
  conversationKey,
  defaultMessages,
  initialMessages = [],
  onRequest,
  onError,
}: UseXChatOptions): UseXChatResult {
  const source = defaultMessages ?? initialMessages;

  // 用 ref 持有最新的来源：它只在 conversationKey 变化时被读取，
  // 因此调用方传数组字面量也不会每次渲染都触发重置。
  const sourceRef = useRef<XChatDefaultMessages>(source);
  sourceRef.current = source;

  const [messages, setMessagesState] = useState<XMessage[]>(() =>
    Array.isArray(source) ? cloneMessages(source) : [],
  );
  const [loading, setLoading] = useState(false);
  const [isDefaultMessagesRequesting, setRequesting] = useState(false);
  const counterRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  /** 最近一次解析出的默认消息，供 clear() 复位使用 */
  const baselineRef = useRef<XMessage[]>(
    Array.isArray(source) ? cloneMessages(source) : [],
  );
  const mountedRef = useRef(true);
  const keyRef = useRef(conversationKey);
  keyRef.current = conversationKey;

  const nextId = () => `x-msg-${++counterRef.current}`;

  /**
   * 按 id 定位 assistant 消息。
   *
   * 刻意**不**用「当前 assistant id」这样的 ref：切换会话会中止旧请求，
   * 而旧请求的收尾是异步的；若收尾时去读共享 ref，就会把新会话里
   * 刚创建的 assistant 占位误标为完成。把 id 捕获在闭包里才没有这个竞态。
   */
  const patchById = useCallback(
    (id: string, patch: Partial<Pick<XMessage, 'content' | 'status'>>) => {
      setMessagesState((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, ...patch } : message,
        ),
      );
    },
    [],
  );

  /** 仅把「仍是 loading」的那条置为 success，不覆盖 error 态 */
  const settleById = useCallback((id: string) => {
    setMessagesState((prev) =>
      prev.map((message) =>
        message.id === id && message.status === 'loading'
          ? { ...message, status: 'success' }
          : message,
      ),
    );
  }, []);

  /** 求值默认消息：数组直接克隆，函数则调用（可能返回 Promise） */
  const resolveDefault = useCallback(async (): Promise<XMessage[]> => {
    const current = sourceRef.current;
    const resolved =
      typeof current === 'function'
        ? await current({ conversationKey: keyRef.current })
        : current;
    return cloneMessages(resolved ?? []);
  }, []);

  // 挂载 + conversationKey 变化：重新初始化消息
  useEffect(() => {
    let cancelled = false;
    const first = mountedRef.current;
    mountedRef.current = false;

    // 挂载时若来源是数组，useState 初值已经处理过，无需再走一遍
    if (first && !(typeof sourceRef.current === 'function')) return undefined;

    // 切换会话：先中止旧请求，避免它的增量写进新会话
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setRequesting(true);

    void (async () => {
      try {
        const next = await resolveDefault();
        if (cancelled) return;
        baselineRef.current = next;
        setMessagesState(next);
      } finally {
        if (!cancelled) setRequesting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationKey, resolveDefault]);

  const send = useCallback(
    (content: string) => {
      if (loading) return; // 串行语义：进行中的请求未结束时忽略新发送
      if (!content.trim()) return; // 空白内容忽略

      const userMessage: XMessage = { id: nextId(), role: 'user', content };
      const assistantMessage: XMessage = {
        id: nextId(),
        role: 'assistant',
        content: '',
        status: 'loading',
      };
      const assistantId = assistantMessage.id;

      const history = cloneMessages([...messages, userMessage, assistantMessage]);
      setMessagesState(history);

      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      void (async () => {
        try {
          await onRequest({
            message: content,
            messages: history,
            signal: controller.signal,
            update: (patch) => patchById(assistantId, patch),
          });
          settleById(assistantId);
        } catch (error) {
          // stop() / 切换会话触发的 abort 属正常结束：保留已生成的部分内容
          if (isAbortError(error)) {
            settleById(assistantId);
            return;
          }
          patchById(assistantId, { status: 'error' });
          onError?.(error instanceof Error ? error : new Error(String(error)));
        } finally {
          // 只有当这次请求仍是「当前请求」时才收尾：切换会话后旧的收尾
          // 不能把新会话刚点亮的 loading 态按下去
          if (abortRef.current === controller) {
            abortRef.current = null;
            setLoading(false);
          }
        }
      })();
    },
    [loading, messages, onRequest, onError, patchById, settleById],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setMessagesState(cloneMessages(baselineRef.current));
  }, []);

  const setMessages = useCallback((next: XMessage[]) => {
    // 直接替换，不触发请求；进行中的请求若仍在跑，其 update 会因 id 失配而落空
    setMessagesState(cloneMessages(next));
  }, []);

  return {
    messages,
    loading,
    isDefaultMessagesRequesting,
    send,
    stop,
    clear,
    setMessages,
  };
}
