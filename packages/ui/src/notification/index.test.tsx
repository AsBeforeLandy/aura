import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { notification, _resetNotificationState } from './index';

describe('Notification', () => {
  beforeEach(() => {
    _resetNotificationState();
  });

  afterEach(() => {
    _resetNotificationState();
    vi.useRealTimers();
  });

  it('调用 notification.open 应该渲染通知', async () => {
    act(() => {
      notification.open({ content: '基本通知' });
    });

    await waitFor(() => {
      const content = document.querySelector('.aura-notification-content');
      expect(content?.textContent).toBe('基本通知');
    });
  });

  it('应该渲染标题和内容', async () => {
    act(() => {
      notification.open({ title: '通知标题', content: '通知内容' });
    });

    await waitFor(() => {
      const title = document.querySelector('.aura-notification-title');
      const content = document.querySelector('.aura-notification-content');
      expect(title?.textContent).toBe('通知标题');
      expect(content?.textContent).toBe('通知内容');
    });
  });

  it('notification.success 应该渲染成功样式', async () => {
    act(() => {
      notification.success({ content: '操作成功' });
    });

    await waitFor(() => {
      const el = document.querySelector('.aura-notification');
      expect(el?.classList.contains('aura-notification-success')).toBe(true);
    });
  });

  it('notification.error 应该渲染错误样式', async () => {
    act(() => {
      notification.error({ content: '操作失败' });
    });

    await waitFor(() => {
      const el = document.querySelector('.aura-notification');
      expect(el?.classList.contains('aura-notification-error')).toBe(true);
    });
  });

  it('notification.warning 应该渲染警告样式', async () => {
    act(() => {
      notification.warning({ content: '请注意' });
    });

    await waitFor(() => {
      const el = document.querySelector('.aura-notification');
      expect(el?.classList.contains('aura-notification-warning')).toBe(true);
    });
  });

  it('notification.info 应该渲染信息样式', async () => {
    act(() => {
      notification.info({ content: '提示信息' });
    });

    await waitFor(() => {
      const el = document.querySelector('.aura-notification');
      expect(el?.classList.contains('aura-notification-info')).toBe(true);
    });
  });

  it('通知应该在指定时间后自动消失', async () => {
    vi.useFakeTimers();

    act(() => {
      notification.open({ content: '自动消失', duration: 1000 });
    });

    // 等待初始渲染
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(document.querySelector('.aura-notification-content')?.textContent).toBe('自动消失');

    // 推进到超时时间
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 推进退场动画（300ms handleClose 中的 setTimeout）+ 400ms（容器清理延迟）
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(document.querySelector('.aura-notification')).toBeNull();
  });

  it('多条通知应该同时存在', async () => {
    act(() => {
      notification.success({ content: '成功' });
      notification.error({ content: '失败' });
    });

    await waitFor(() => {
      const items = document.querySelectorAll('.aura-notification');
      expect(items.length).toBe(2);
    });
  });

  it('应该渲染关闭按钮', async () => {
    act(() => {
      notification.open({ content: '可关闭' });
    });

    await waitFor(() => {
      const closeBtn = document.querySelector('.aura-notification-close');
      expect(closeBtn).not.toBeNull();
    });
  });

  it('点击关闭按钮应该移除通知', async () => {
    vi.useFakeTimers();

    act(() => {
      notification.open({ content: '点关闭', duration: 60000 });
    });

    // 等待初始渲染
    act(() => {
      vi.advanceTimersByTime(100);
    });

    const closeBtn = document.querySelector('.aura-notification-close');
    expect(closeBtn).not.toBeNull();

    // 点击关闭
    act(() => {
      (closeBtn as HTMLElement).click();
    });

    // 推进退场动画（300ms）+ 容器清理（400ms）
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(document.querySelector('.aura-notification')).toBeNull();
  });

  it('应该支持不同的 placement', async () => {
    act(() => {
      notification.open({ content: '左上', placement: 'topLeft' });
      notification.open({ content: '右下', placement: 'bottomRight' });
    });

    await waitFor(() => {
      const topLeftContainer = document.querySelector('.aura-notification-container-topLeft');
      const bottomRightContainer = document.querySelector('.aura-notification-container-bottomRight');
      expect(topLeftContainer).not.toBeNull();
      expect(bottomRightContainer).not.toBeNull();
    });
  });

  it('关闭时应该触发 onClose 回调', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    act(() => {
      notification.open({ content: '有回调', duration: 500, onClose });
    });

    // 等待初始渲染
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 推进到超时
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 推进退场动画
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
