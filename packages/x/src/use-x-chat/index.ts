import { useCallback, useRef, useState } from 'react';
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

export interface UseXChatOptions {
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
  /**
   * 发送一条用户消息：追加 user 消息与 assistant 占位（loading 态）后调用 onRequest。
   * loading 期间或内容为空白时忽略。
   */
  send(content: string): void;
  /** 中止当前请求（保留 assistant 已生成的部分内容） */
  stop(): void;
  /** 中止当前请求并清空消息，回到 initialMessages */
  clear(): void;
}

const cloneMessages = (messages: XMessage[]): XMessage[] =>
  messages.map((message) => ({ ...message }));

/**
 * useXChat — 对话消息编排 Hook（与传输层 useXStream 正交）。
 *
 * 职责：维护消息列表状态机（user / assistant 成对追加、loading 态、
 * 增量更新、错误态、中止与清空）。**不做传输**——怎么请求由 `onRequest` 决定，
 * 典型组合是内部调用 `useXStream().fetchData` 并在 onMessage 里 `update` 内容。
 */
export function useXChat({
  initialMessages = [],
  onRequest,
  onError,
}: UseXChatOptions): UseXChatResult {
  const [messages, setMessages] = useState<XMessage[]>(() =>
    cloneMessages(initialMessages),
  );
  const initialRef = useRef<XMessage[]>(cloneMessages(initialMessages));
  const [loading, setLoading] = useState(false);
  const counterRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string | null>(null);

  const nextId = () => `x-msg-${++counterRef.current}`;

  const patchAssistant = useCallback(
    (patch: Partial<Pick<XMessage, 'content' | 'status'>>) => {
      const id = assistantIdRef.current;
      if (!id) return;
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? { ...message, ...patch } : message)),
      );
    },
    [],
  );

  const resetInFlight = useCallback(() => {
    setLoading(false);
    abortRef.current = null;
    assistantIdRef.current = null;
  }, []);

  /** 结束请求：仅把「仍是 loading」的 assistant 消息置为 success，不覆盖 error 态 */
  const settleSuccess = useCallback(() => {
    const id = assistantIdRef.current;
    if (id) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id && message.status === 'loading'
            ? { ...message, status: 'success' }
            : message,
        ),
      );
    }
    resetInFlight();
  }, [resetInFlight]);

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
      assistantIdRef.current = assistantMessage.id;

      const history = cloneMessages([...messages, userMessage, assistantMessage]);
      setMessages(history);

      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      void (async () => {
        try {
          await onRequest({
            message: content,
            messages: history,
            signal: controller.signal,
            update: patchAssistant,
          });
          settleSuccess();
        } catch (error) {
          // stop() 触发的 abort 属正常结束：保留已生成的部分内容
          if (isAbortError(error)) {
            settleSuccess();
            return;
          }
          patchAssistant({ status: 'error' });
          resetInFlight();
          onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      })();
    },
    [loading, messages, onRequest, onError, patchAssistant, settleSuccess, resetInFlight],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages(cloneMessages(initialRef.current));
    resetInFlight();
  }, [resetInFlight]);

  return { messages, loading, send, stop, clear };
}
