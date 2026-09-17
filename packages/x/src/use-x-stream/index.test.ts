import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useXStream, type XStreamChunk } from './index';

/** 把文本转成字节流 */
function byteStream(...strings: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const text of strings) controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

/** 永不结束、可被 signal 中止的字节流（测 abort 用） */
function hangingStream(signal: AbortSignal): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('data: partial\n\n'));
      // 用 error() 而非 abort()（后者不存在于 DefaultController）：
      // 以 AbortError 结束读流，等价于真实 fetch 被 signal 中断的行为
      signal.addEventListener('abort', () => {
        controller.error(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      });
    },
  });
}

function sseResponse(...strings: string[]): Response {
  return new Response(byteStream(...strings), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function receivedData(onMessage: ReturnType<typeof vi.fn>): string[] {
  return onMessage.mock.calls.map((call: unknown[]) => (call[0] as XStreamChunk).data);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useXStream', () => {
  it('正常：SSE 模式逐条 onMessage，结束触发 onDone，streaming 回落', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse('data: a\n\n', 'data: b\n\n')));
    const onMessage = vi.fn();
    const onDone = vi.fn();

    const { result } = renderHook(() => useXStream());
    expect(result.current.streaming).toBe(false);

    await act(() =>
      result.current.fetchData({ url: '/api/chat', onMessage, onDone }),
    );

    expect(receivedData(onMessage)).toEqual(['a', 'b']);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(result.current.streaming).toBe(false);
  });

  it('正常：消息对象带 data 与 event 字段', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse('event: delta\ndata: 你好\n\n')));
    const onMessage = vi.fn();

    const { result } = renderHook(() => useXStream());
    await act(() => result.current.fetchData({ url: '/api/chat', onMessage }));

    expect(onMessage).toHaveBeenCalledWith({ data: '你好', event: 'delta' });
  });

  it('正常：body 为对象时自动 JSON.stringify 并设置 Content-Type', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      sseResponse('data: ok\n\n'),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useXStream());
    await act(() =>
      result.current.fetchData({ url: '/api/chat', body: { message: 'hi' }, onMessage: () => {} }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"message":"hi"}');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('异常：HTTP 500 触发 onError 且不触发 onDone', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('boom', { status: 500 })));
    const onError = vi.fn();
    const onDone = vi.fn();

    const { result } = renderHook(() => useXStream());
    await act(() =>
      result.current.fetchData({ url: '/api/chat', onMessage: () => {}, onDone, onError }),
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(String(onError.mock.calls[0][0])).toContain('500');
    expect(onDone).not.toHaveBeenCalled();
  });

  it('正常：纯文本流（非 SSE Content-Type）按增量原样产出', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(byteStream('Hel', 'lo'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
      ),
    );
    const onMessage = vi.fn();

    const { result } = renderHook(() => useXStream());
    await act(() => result.current.fetchData({ url: '/api/chat', onMessage }));

    expect(receivedData(onMessage).join('')).toBe('Hello');
  });

  it('边界：abort() 静默中止——不触发 onError / onDone，streaming 回落', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      const signal = init?.signal ?? new AbortController().signal;
      return new Response(hangingStream(signal), {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }));
    const onMessage = vi.fn();
    const onError = vi.fn();
    const onDone = vi.fn();

    const { result } = renderHook(() => useXStream());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.fetchData({ url: '/api/chat', onMessage, onError, onDone });
    });
    await waitFor(() => expect(result.current.streaming).toBe(true));

    await act(async () => {
      result.current.abort();
      await pending;
    });

    expect(receivedData(onMessage)).toEqual(['partial']); // 已产出的内容保留
    expect(onError).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    expect(result.current.streaming).toBe(false);
  });

  it('边界：连续 fetchData 两次，第一条流被中止且不触发其 onError', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const signal = init?.signal ?? new AbortController().signal;
      return new Response(hangingStream(signal), {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const firstOnError = vi.fn();

    const { result } = renderHook(() => useXStream());
    let first!: Promise<void>;
    act(() => {
      first = result.current.fetchData({ url: '/api/chat', onMessage: () => {}, onError: firstOnError });
    });
    await waitFor(() => expect(result.current.streaming).toBe(true));

    // 第二条流是「永不结束」的 hanging 流：不能 await 它本身，
    // 只需确认第一条流被中止后能正常收尾
    act(() => {
      void result.current.fetchData({ url: '/api/chat', onMessage: () => {} });
    });
    await act(() => first);

    expect(firstOnError).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.streaming).toBe(false);
  }, { timeout: 10000 });
});
