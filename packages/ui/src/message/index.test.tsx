import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { message, _resetMessageState } from './index';

describe('Message', () => {
  beforeEach(() => {
    _resetMessageState();
  });

  afterEach(() => {
    _resetMessageState();
    vi.useRealTimers();
  });

  it('调用 message.info 应该在 document.body 上创建消息', async () => {
    act(() => {
      message.info('测试信息');
    });

    await waitFor(() => {
      const content = document.querySelector('.aura-message-content');
      expect(content?.textContent).toBe('测试信息');
    });
  });

  it('调用 message.success 应该渲染成功消息', async () => {
    act(() => {
      message.success('操作成功');
    });

    await waitFor(() => {
      const msgEl = document.querySelector('.aura-message');
      expect(msgEl).not.toBeNull();
      expect(msgEl?.classList.contains('aura-message-success')).toBe(true);
    });
  });

  it('调用 message.error 应该渲染错误消息', async () => {
    act(() => {
      message.error('操作失败');
    });

    await waitFor(() => {
      const msgEl = document.querySelector('.aura-message');
      expect(msgEl?.classList.contains('aura-message-error')).toBe(true);
    });
  });

  it('调用 message.warning 应该渲染警告消息', async () => {
    act(() => {
      message.warning('请注意');
    });

    await waitFor(() => {
      const msgEl = document.querySelector('.aura-message');
      expect(msgEl?.classList.contains('aura-message-warning')).toBe(true);
    });
  });

  it('调用 message.loading 应该渲染加载消息', async () => {
    act(() => {
      message.loading('加载中...');
    });

    await waitFor(() => {
      const msgEl = document.querySelector('.aura-message');
      expect(msgEl?.classList.contains('aura-message-loading')).toBe(true);
      const icon = document.querySelector('.aura-message-loading-icon');
      expect(icon).not.toBeNull();
    });
  });

  it('消息应该在指定时间后自动消失', async () => {
    vi.useFakeTimers();

    act(() => {
      message.info('3秒后消失', 3000);
    });

    // 等待初始渲染（包括 requestAnimationFrame 和 React 渲染）
    // 在 fake timers 下使用 act 包装所有 timer 推进
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 确认消息已渲染
    expect(document.querySelector('.aura-message-content')?.textContent).toBe('3秒后消失');

    // 推进到 3 秒触发关闭
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // 推进退场动画
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // 消息应已被移除
    expect(document.querySelector('.aura-message')).toBeNull();
  });

  it('多条消息应该垂直堆叠', async () => {
    act(() => {
      message.info('第一条');
      message.success('第二条');
      message.error('第三条');
    });

    await waitFor(() => {
      const messages = document.querySelectorAll('.aura-message');
      expect(messages.length).toBe(3);
    });
  });

  it('消息应该有图标元素', async () => {
    act(() => {
      message.success('有图标的消息');
    });

    await waitFor(() => {
      const icon = document.querySelector('.aura-message-icon');
      expect(icon).not.toBeNull();
    });
  });
});
