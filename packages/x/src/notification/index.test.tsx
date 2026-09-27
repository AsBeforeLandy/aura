import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { XNotification, useNotification } from './index';

/** 极简 window.Notification 替身：记录实例、可手动触发回调 */
class MockNotification {
  static permission: NotificationPermission = 'granted';

  static requestPermission = vi.fn(async () => MockNotification.permission);

  static instances: MockNotification[] = [];

  static reset() {
    MockNotification.permission = 'granted';
    MockNotification.instances = [];
    MockNotification.requestPermission = vi.fn(
      async () => MockNotification.permission,
    );
  }

  onclick: ((event: Event) => void) | null = null;

  onshow: ((event: Event) => void) | null = null;

  onclose: ((event: Event) => void) | null = null;

  onerror: ((event: Event) => void) | null = null;

  title: string;

  options?: NotificationOptions;

  close = vi.fn(() => {
    this.onclose?.(new Event('close'));
  });

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
}

beforeEach(() => {
  MockNotification.reset();
  vi.stubGlobal('Notification', MockNotification);
});

afterEach(() => {
  // 清空模块内记录，避免用例之间互相影响
  XNotification.close();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('XNotification', () => {
  it('正常：permission 实时读取原生状态', () => {
    expect(XNotification.permission).toBe('granted');
    MockNotification.permission = 'default';
    expect(XNotification.permission).toBe('default');
  });

  it('正常：open 创建原生实例并透传 title/body/tag', () => {
    XNotification.open({ title: '任务完成', body: '共 3 步', tag: 'task' });

    expect(MockNotification.instances).toHaveLength(1);
    expect(MockNotification.instances[0].title).toBe('任务完成');
    expect(MockNotification.instances[0].options).toEqual({
      body: '共 3 步',
      tag: 'task',
    });
  });

  it('正常：close 传 tag 只关闭对应通知', () => {
    XNotification.open({ title: 'A', tag: 'a' });
    XNotification.open({ title: 'B', tag: 'b' });

    XNotification.close(['a']);

    expect(MockNotification.instances[0].close).toHaveBeenCalledTimes(1);
    expect(MockNotification.instances[1].close).not.toHaveBeenCalled();
  });

  it('正常：close 不传参数关闭全部（含未带 tag 的通知）', () => {
    XNotification.open({ title: '无 tag' });
    XNotification.open({ title: '有 tag', tag: 'x' });

    XNotification.close();

    expect(MockNotification.instances[0].close).toHaveBeenCalledTimes(1);
    expect(MockNotification.instances[1].close).toHaveBeenCalledTimes(1);
  });

  it('正常：onClick 收到的 close 回调可关闭本条通知', () => {
    const onClick = vi.fn();
    XNotification.open({ title: '可点击', tag: 'click', onClick });

    MockNotification.instances[0].onclick?.(new Event('click'));
    expect(onClick).toHaveBeenCalledTimes(1);

    const close = onClick.mock.calls[0][1] as () => void;
    close();
    expect(MockNotification.instances[0].close).toHaveBeenCalledTimes(1);
  });

  it('正常：onShow 回调被挂载到原生实例上', () => {
    const onShow = vi.fn();
    XNotification.open({ title: '展示', onShow });

    MockNotification.instances[0].onshow?.(new Event('show'));
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('边界：未授权时 open 不产生任何效果', () => {
    MockNotification.permission = 'denied';

    XNotification.open({ title: '不该出现' });

    expect(MockNotification.instances).toHaveLength(0);
  });

  it('边界：环境不支持 Notification 时全部方法为 no-op，且不抛错', async () => {
    vi.stubGlobal('Notification', undefined);

    expect(XNotification.permission).toBe('denied');
    expect(() => XNotification.open({ title: 'x' })).not.toThrow();
    expect(() => XNotification.close()).not.toThrow();
    await expect(XNotification.requestPermission()).resolves.toBe('denied');
  });

  it('边界：duration 到期后自动关闭', () => {
    vi.useFakeTimers();
    XNotification.open({ title: '自动关闭', duration: 1000 });

    expect(MockNotification.instances[0].close).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(MockNotification.instances[0].close).toHaveBeenCalledTimes(1);
  });

  it('边界：接受 antdx 风格 { openConfig, closeConfig } 并先关旧通知', () => {
    XNotification.open({ title: '旧的', tag: 'report' });

    XNotification.open({
      openConfig: { title: '新的', tag: 'report' },
      closeConfig: ['report'],
    });

    expect(MockNotification.instances[0].close).toHaveBeenCalledTimes(1);
    expect(MockNotification.instances[1].title).toBe('新的');
  });

  it('异常：原生构造函数抛错时不向外抛', () => {
    class ThrowingNotification {
      static permission: NotificationPermission = 'granted';

      static requestPermission = async () => 'granted' as NotificationPermission;

      constructor() {
        throw new Error('invalid title');
      }
    }
    vi.stubGlobal('Notification', ThrowingNotification);

    expect(() => XNotification.open({ title: '' })).not.toThrow();
  });

  it('异常：requestPermission 抛错时兜底为 denied', async () => {
    class ThrowingPermission {
      static permission: NotificationPermission = 'default';

      static requestPermission = () => {
        throw new Error('blocked by permissions policy');
      };
    }
    vi.stubGlobal('Notification', ThrowingPermission);

    await expect(XNotification.requestPermission()).resolves.toBe('denied');
  });

  it('正常：useNotification 挂载后同步真实权限，并可直接 open', async () => {
    const { result } = renderHook(() => useNotification());

    await waitFor(() => {
      expect(result.current[0].permission).toBe('granted');
    });

    act(() => {
      result.current[1].open({ title: '来自 Hook', tag: 'hook' });
    });
    expect(MockNotification.instances).toHaveLength(1);
  });

  it('异常：SSR 首帧固定为 denied（避免水合不一致）', () => {
    const Probe = () => {
      const [{ permission }] = useNotification();
      return <span>{permission}</span>;
    };

    // 服务端渲染不执行 effect，因此拿到的是 useState 的初值
    expect(renderToString(<Probe />)).toContain('denied');
  });

  it('异常：环境不支持时 useNotification 的 permission 保持 denied', async () => {
    vi.stubGlobal('Notification', undefined);

    const { result } = renderHook(() => useNotification());
    await waitFor(() => {
      expect(result.current[0].permission).toBe('denied');
    });
  });

  it('异常：useNotification 的 requestPermission 会更新 permission 状态', async () => {
    MockNotification.permission = 'default';
    MockNotification.requestPermission = vi.fn(async () => {
      MockNotification.permission = 'granted';
      return 'granted' as NotificationPermission;
    });

    const { result } = renderHook(() => useNotification());
    await waitFor(() => {
      expect(result.current[0].permission).toBe('default');
    });

    await act(async () => {
      await result.current[1].requestPermission();
    });
    expect(result.current[0].permission).toBe('granted');
  });
});
