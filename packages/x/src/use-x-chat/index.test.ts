import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useXChat, type XMessage } from './index';

describe('useXChat', () => {
  it('正常：send 成对追加 user/assistant，onRequest 可增量更新，结束后 status=success', async () => {
    const { result } = renderHook(() =>
      useXChat({
        onRequest: async ({ message, messages, update }) => {
          expect(message).toBe('hi');
          expect(messages.at(-1)?.role).toBe('assistant');
          update({ content: 'Hel' });
          update({ content: 'Hello' });
        },
      }),
    );

    act(() => result.current.send('hi'));
    // 占位立即出现：user + assistant(loading)
    // （act 会冲掉微任务，onRequest 里的同步 update 可能已执行，故不断言 content 为空）
    expect(result.current.messages.at(0)).toMatchObject({ role: 'user', content: 'hi' });
    expect(result.current.messages.at(-1)).toMatchObject({
      role: 'assistant',
      status: 'loading',
    });
    expect(result.current.loading).toBe(true);

    await waitFor(() =>
      expect(result.current.messages.at(-1)).toMatchObject({ content: 'Hello', status: 'success' }),
    );
    expect(result.current.loading).toBe(false);
  });

  it('边界：空白内容与 loading 期间的 send 被忽略', async () => {
    const onRequest = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    const { result } = renderHook(() => useXChat({ onRequest }));

    act(() => result.current.send('   '));
    expect(result.current.messages).toHaveLength(0);

    act(() => result.current.send('hi'));
    expect(result.current.loading).toBe(true);
    act(() => result.current.send('second')); // loading 中被忽略
    expect(onRequest).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('正常：stop() 中止请求，保留已生成的部分内容并结束 loading', async () => {
    const { result } = renderHook(() =>
      useXChat({
        onRequest: async ({ signal, update }) => {
          update({ content: '部分' });
          await new Promise((_resolve, reject) =>
            signal.addEventListener('abort', () => reject(signal.reason)),
          );
        },
      }),
    );

    act(() => result.current.send('问'));
    await waitFor(() => expect(result.current.messages.at(-1)?.content).toBe('部分'));

    act(() => result.current.stop());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // 部分内容保留，状态收敛为 success
    expect(result.current.messages.at(-1)).toMatchObject({ content: '部分', status: 'success' });
  });

  it('异常：onRequest 抛错 → assistant 进入 error 态并回调 onError', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useXChat({
        onRequest: async () => {
          throw new Error('后端 500');
        },
        onError,
      }),
    );

    act(() => result.current.send('问'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages.at(-1)).toMatchObject({ status: 'error' });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: '后端 500' }),
    );
  });

  it('正常：update 只合并 assistant 占位，不覆盖其他消息', async () => {
    const { result } = renderHook(() =>
      useXChat({
        onRequest: async ({ update }) => {
          update({ content: '回复' });
        },
      }),
    );

    act(() => result.current.send('问'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.messages[0]).toEqual({
      id: expect.any(String),
      role: 'user',
      content: '问',
    });
    expect(result.current.messages[1].content).toBe('回复');
  });

  it('边界：clear() 中止请求并回到 initialMessages', async () => {
    const initial: XMessage[] = [
      { id: 'm0', role: 'assistant', content: '你好，我是 Aura' },
    ];
    const { result } = renderHook(() =>
      useXChat({
        initialMessages: initial,
        onRequest: async ({ signal }) => {
          await new Promise((_resolve, reject) =>
            signal.addEventListener('abort', () => reject(signal.reason)),
          );
        },
      }),
    );

    act(() => result.current.send('问'));
    expect(result.current.messages.length).toBe(3);

    act(() => result.current.clear());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('你好，我是 Aura');
  });
});
