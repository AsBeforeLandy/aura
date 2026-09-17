import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSSEStream, type XStreamChunk } from './parse-sse';

export type { XStreamChunk } from './parse-sse';

export interface FetchDataStreamOptions {
  /** 流式接口地址 */
  url: string;
  /** 缺省：body 存在时为 POST，否则 GET */
  method?: string;
  headers?: Record<string, string>;
  /**
   * 请求体。传普通对象时自动 `JSON.stringify` 并设置 `Content-Type: application/json`；
   * FormData / Blob 等特殊类型请自行序列化后以字符串传入。
   */
  body?: unknown;
  /** 每解析出一条消息回调一次 */
  onMessage(chunk: XStreamChunk): void;
  /** 流正常结束（含 abort 静默结束）后回调 */
  onDone?(): void;
  /** 请求或读流出错（abort 不算）后回调 */
  onError?(error: Error): void;
}

export interface UseXStreamResult {
  /** 是否有进行中的流式请求 */
  streaming: boolean;
  /**
   * 发起一次流式请求并逐条消费。同一时刻只保留一条流：
   * 再次 fetchData 会先 abort 上一次（静默结束，不触发 onError）。
   */
  fetchData(options: FetchDataStreamOptions): Promise<void>;
  /** 中止当前流（静默结束：不触发 onError） */
  abort(): void;
}

/** 判定是否为 abort 导致的错误（fetch / 读流被 signal 中断时抛出） */
export function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === 'AbortError'
      : error instanceof Error && error.name === 'AbortError'
  );
}

/**
 * useXStream — 流式传输层 Hook。
 *
 * 负责：fetch + 读流 + SSE / 纯文本两种模式的解析 + abort 生命周期，
 * **不做任何消息状态管理**（那是 useXChat 的职责），两者保持正交。
 *
 * - 响应 `Content-Type` 含 `text/event-stream` → 按 SSE 解析；
 * - 其余类型按「纯文本增量流」处理，每个字节块原样作为一条消息产出。
 */
export function useXStream(): UseXStreamResult {
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // 卸载时中止在途流，避免对已卸载组件回调 setState
  useEffect(
    () => () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    },
    [],
  );

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const fetchData = useCallback(async (options: FetchDataStreamOptions) => {
    // 串行语义：新请求先中止上一次（静默结束，不触发其 onError）
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStreaming(true);

    const finishStreaming = () => {
      if (mountedRef.current) setStreaming(false);
      if (controllerRef.current === controller) controllerRef.current = null;
    };

    try {
      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        ...options.headers,
      };

      let body: BodyInit | undefined;
      const raw = options.body;
      if (raw !== undefined && raw !== null) {
        if (typeof raw === 'object') {
          body = JSON.stringify(raw);
          headers['Content-Type'] ??= 'application/json';
        } else {
          body = raw as BodyInit;
        }
      }

      const response = await fetch(options.url, {
        method: options.method ?? (body !== undefined ? 'POST' : 'GET'),
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `[XStream] 请求失败：${response.status} ${response.statusText || ''}`.trim(),
        );
      }

      const contentType = response.headers.get('Content-Type') ?? '';

      if (response.body && contentType.includes('text/event-stream')) {
        // SSE 模式
        for await (const chunk of parseSSEStream(response.body)) {
          options.onMessage(chunk);
        }
      } else if (response.body) {
        // 纯文本增量流模式：每个字节块原样产出
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (text) options.onMessage({ data: text, event: 'message' });
        }
      } else {
        // 兜底：无读流的响应，整体作为一条消息
        const text = await response.text();
        if (text) options.onMessage({ data: text, event: 'message' });
      }

      options.onDone?.();
    } catch (error) {
      // abort 是主动停止，属于「正常结束」，静默处理
      if (!isAbortError(error)) {
        options.onError?.(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    } finally {
      finishStreaming();
    }
  }, []);

  return { streaming, fetchData, abort };
}
