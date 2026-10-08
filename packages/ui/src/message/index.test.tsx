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

  it('内容应该支持 ReactNode', async () => {
    act(() => {
      message.info(<span data-testid="rich-content">带链接的内容</span>);
    });

    await waitFor(() => {
      const node = document.querySelector('[data-testid="rich-content"]');
      expect(node).not.toBeNull();
      expect(node?.textContent).toBe('带链接的内容');
    });
  });

  it('同 key 重复调用应该原位更新而不是新增', async () => {
    act(() => {
      message.loading({ key: 'upload', content: '上传中...' });
    });

    await waitFor(() => {
      expect(document.querySelectorAll('.aura-message').length).toBe(1);
      expect(
        document
          .querySelector('.aura-message')
          ?.classList.contains('aura-message-loading'),
      ).toBe(true);
    });

    act(() => {
      message.success({ key: 'upload', content: '上传完成' });
    });

    await waitFor(() => {
      expect(document.querySelectorAll('.aura-message').length).toBe(1);
      const msg = document.querySelector('.aura-message');
      expect(msg?.classList.contains('aura-message-success')).toBe(true);
      expect(msg?.textContent).toContain('上传完成');
    });
  });

  it('同 key 更新应该重置自动关闭计时', async () => {
    vi.useFakeTimers();

    act(() => {
      message.info({ key: 'refresh', content: '第一次', duration: 3000 });
      vi.advanceTimersByTime(100);
    });
    act(() => {
      // 第 2 秒时同 key 再来一条（默认 3s），计时器应重新计
      vi.advanceTimersByTime(2000);
      message.info({ key: 'refresh', content: '第二次' });
    });

    // 距第一条已过 3s，但距第二条只有 1s，不应关闭
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.querySelector('.aura-message')).not.toBeNull();

    // 再推进到第二条的 3s 计时结束并走完退场
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(document.querySelector('.aura-message')).toBeNull();
  });

  it('destroy(key) 应该只关闭指定消息', async () => {
    act(() => {
      message.info({ key: 'a', content: 'A' });
      message.info({ key: 'b', content: 'B' });
    });

    await waitFor(() => {
      expect(document.querySelectorAll('.aura-message').length).toBe(2);
    });

    act(() => {
      message.destroy('a');
    });

    await waitFor(() => {
      const messages = document.querySelectorAll('.aura-message');
      expect(messages.length).toBe(1);
      expect(messages[0]?.textContent).toContain('B');
    });
  });

  it('destroy() 不传参数应该关闭全部', async () => {
    act(() => {
      message.info('A');
      message.success('B');
    });

    await waitFor(() => {
      expect(document.querySelectorAll('.aura-message').length).toBe(2);
    });

    act(() => {
      message.destroy();
    });

    await waitFor(() => {
      expect(document.querySelectorAll('.aura-message').length).toBe(0);
    });
  });

  it('destroy 应该触发 onClose 回调', async () => {
    const onClose = vi.fn();

    act(() => {
      message.info({ key: 'callback', content: '有回调', onClose });
    });

    await waitFor(() => {
      expect(document.querySelector('.aura-message')).not.toBeNull();
    });

    act(() => {
      message.destroy('callback');
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('icon 参数应该覆盖默认变体图标', async () => {
    act(() => {
      message.success({
        content: '自定义图标',
        icon: <span data-testid="custom-icon">★</span>,
      });
    });

    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="custom-icon"]'),
      ).not.toBeNull();
    });
  });
});
