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

  it('正常：conversationKey 变化时按 defaultMessages 重新初始化消息', async () => {
    const store: Record<string, XMessage[]> = {
      a: [{ id: 'a1', role: 'user', content: '会话 A 的消息' }],
      b: [{ id: 'b1', role: 'user', content: '会话 B 的消息' }],
    };
    const { result, rerender } = renderHook(
      ({ k }: { k: string }) =>
        useXChat({
          conversationKey: k,
          defaultMessages: ({ conversationKey }) =>
            store[String(conversationKey)] ?? [],
          onRequest: async () => {},
        }),
      { initialProps: { k: 'a' } },
    );

    await waitFor(() =>
      expect(result.current.messages[0]?.content).toBe('会话 A 的消息'),
    );

    rerender({ k: 'b' });
    await waitFor(() =>
      expect(result.current.messages[0]?.content).toBe('会话 B 的消息'),
    );

    // 切回来同样按 key 取
    rerender({ k: 'a' });
    await waitFor(() =>
      expect(result.current.messages[0]?.content).toBe('会话 A 的消息'),
    );
  });

  it('边界：defaultMessages 为异步函数时 isDefaultMessagesRequesting 反映加载态', async () => {
    const { result } = renderHook(() =>
      useXChat({
        conversationKey: 'a',
        defaultMessages: async ({ conversationKey }) => {
          await new Promise((resolve) => setTimeout(resolve, 20));
          return [
            { id: 'h1', role: 'assistant', content: `历史：${conversationKey}` },
          ];
        },
        onRequest: async () => {},
      }),
    );

    expect(result.current.isDefaultMessagesRequesting).toBe(true);
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0].content).toBe('历史：a');
    expect(result.current.isDefaultMessagesRequesting).toBe(false);
  });

  it('边界：数组字面量不会因引用变化而重置消息', async () => {
    const { result, rerender } = renderHook(() =>
      // 每次渲染都会构造新的 []，若 effect 依赖其引用，消息会被反复清空
      useXChat({ defaultMessages: [], onRequest: async () => {} }),
    );

    act(() => result.current.send('hi'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages).toHaveLength(2);

    rerender();
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('hi');
  });

  it('正常：setMessages 直接替换消息且不触发请求', () => {
    const onRequest = vi.fn(async () => {});
    const { result } = renderHook(() => useXChat({ onRequest }));

    act(() => {
      result.current.setMessages([
        { id: 'x1', role: 'user', content: '来自服务端的消息' },
      ]);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('来自服务端的消息');
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('异常：切换会话中止旧请求，且旧请求的收尾不污染新会话的 loading 态', async () => {
    // 两个请求都挂起，直到被 abort 或手动收尾
    const onRequest = vi.fn(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise<void>((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason));
        }),
    );

    const { result, rerender } = renderHook(
      ({ k }: { k: string }) =>
        useXChat({ conversationKey: k, defaultMessages: [], onRequest }),
      { initialProps: { k: 'a' } },
    );

    act(() => result.current.send('在 A 会话提问'));
    expect(result.current.loading).toBe(true);

    // 切到 B：应中止 A 的请求
    rerender({ k: 'b' });
    await waitFor(() => expect(result.current.messages).toHaveLength(0));
    expect(result.current.loading).toBe(false);

    // 在 B 里发一条并保持挂起
    act(() => result.current.send('在 B 会话提问'));
    expect(result.current.loading).toBe(true);

    // 让 A 那条旧请求的 abort 收尾跑完，它不该把 B 的 loading 按下去
    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(2));
    expect(result.current.loading).toBe(true);
    expect(result.current.messages.at(-1)).toMatchObject({
      role: 'assistant',
      status: 'loading',
    });

    act(() => result.current.stop());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('边界：clear() 回到异步 defaultMessages 解析出的基线', async () => {
    const { result } = renderHook(() =>
      useXChat({
        conversationKey: 'a',
        defaultMessages: async () => [
          { id: 'h', role: 'assistant', content: '基线消息' },
        ],
        onRequest: async () => {},
      }),
    );

    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => result.current.send('问'));
    await waitFor(() => expect(result.current.messages).toHaveLength(3));

    act(() => result.current.clear());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('基线消息');
  });
});
