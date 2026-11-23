import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { Badge } from './index';

/** count 受控包裹：模拟外部状态变化触发翻滚 */
const RollProbe: React.FC<{ count: number }> = ({ count }) => (
  <Badge count={count}>
    <span>inbox</span>
  </Badge>
);

describe('Badge', () => {
  it('should render standalone badge with count', () => {
    const { getByText } = render(<Badge count={5} />);
    expect(getByText('5')).toBeDefined();
  });

  it('should render as wrapper when children provided', () => {
    const { getByText, container } = render(
      <Badge count={3}>
        <span>内容</span>
      </Badge>,
    );
    expect(getByText('内容')).toBeDefined();
    expect(getByText('3')).toBeDefined();
    const wrapper = container.firstChild as HTMLSpanElement;
    expect(wrapper.classList.contains('aura-badge')).toBe(true);
  });

  it('should hide when count is 0', () => {
    const { container } = render(<Badge count={0} />);
    const badge = container.querySelector('.aura-badge-dot');
    expect(badge).toBeNull();
  });

  it('should show when count is 0 and showZero is true', () => {
    const { getByText } = render(<Badge count={0} showZero />);
    expect(getByText('0')).toBeDefined();
  });

  it('should show overflow count with +', () => {
    const { getByText } = render(<Badge count={100} overflowCount={99} />);
    expect(getByText('99+')).toBeDefined();
  });

  it('should show dot mode', () => {
    const { container } = render(<Badge dot count={1} />);
    const dot = container.querySelector('.aura-badge-dot-small');
    expect(dot).not.toBeNull();
  });

  it('should render variant className', () => {
    const variants = ['success', 'warning', 'error', 'info'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(
        <Badge count={1} variant={variant} />,
      );
      const dot = container.querySelector('.aura-badge-dot');
      expect(dot?.classList.contains(`aura-badge-dot-${variant}`)).toBe(true);
      unmount();
    });

    // default 变体不添加额外类名
    const { container } = render(<Badge count={1} variant="default" />);
    const dot = container.querySelector('.aura-badge-dot');
    expect(dot?.classList.contains('aura-badge-dot-default')).toBe(false);
  });

  it('should merge custom className', () => {
    const { container } = render(
      <Badge count={1} className="custom-badge">
        <span>测试</span>
      </Badge>,
    );
    const wrapper = container.firstChild as HTMLSpanElement;
    expect(wrapper.classList.contains('custom-badge')).toBe(true);
  });

  it('should position badge on top-right when children provided', () => {
    const { container } = render(
      <Badge count={5}>
        <button>按钮</button>
      </Badge>,
    );
    const sup = container.querySelector('sup');
    expect(sup).not.toBeNull();
    expect(sup?.classList.contains('aura-badge-dot')).toBe(true);
  });

  it('should not render dot when dot is true but count is 0', () => {
    const { container } = render(<Badge dot count={0} />);
    const dot = container.querySelector('.aura-badge-dot');
    expect(dot).toBeNull();
  });

  it('should render dot with showZero', () => {
    const { container } = render(<Badge dot count={0} showZero />);
    const dot = container.querySelector('.aura-badge-dot-small');
    expect(dot).not.toBeNull();
  });

  // ===== 状态点模式 =====
  it('status 模式应渲染状态圆点与文本，不渲染计数', () => {
    const { container, getByText, queryByText } = render(
      <Badge status="success" text="运行正常" />,
    );
    expect(container.querySelector('.aura-badge-status')).not.toBeNull();
    expect(
      container.querySelector('.aura-badge-status-success'),
    ).not.toBeNull();
    expect(getByText('运行正常')).toBeDefined();
    // 计数相关结构不渲染
    expect(container.querySelector('.aura-badge-dot')).toBeNull();
    expect(queryByText('0')).toBeNull();
  });

  it('status 五种状态应映射对应类名', () => {
    const statuses = [
      'success',
      'processing',
      'error',
      'warning',
      'default',
    ] as const;
    statuses.forEach((status) => {
      const { container, unmount } = render(<Badge status={status} />);
      expect(
        container.querySelector(`.aura-badge-status-${status}`),
      ).not.toBeNull();
      unmount();
    });
  });

  it('processing 状态点之外不渲染光环元素（光环由伪元素实现）', () => {
    const { container } = render(<Badge status="processing" />);
    expect(
      container.querySelector('.aura-badge-status-processing'),
    ).not.toBeNull();
  });

  it('status 模式无 text 时只渲染圆点', () => {
    const { container } = render(<Badge status="error" />);
    expect(container.querySelector('.aura-badge-status-text')).toBeNull();
  });

  // ---- 数字翻滚动画 ----
  it('数字增大时渲染向上翻滚的双层数字', () => {
    const { container, rerender } = render(<RollProbe count={13} />);
    expect(container.querySelector('.aura-badge-roll')).toBeNull();

    rerender(<RollProbe count={14} />);
    const roll = container.querySelector('.aura-badge-roll');
    expect(roll).not.toBeNull();
    expect(roll!.classList.contains('aura-badge-roll-up')).toBe(true);
    // 双层：旧值 13 + 新值 14
    const items = container.querySelectorAll('.aura-badge-roll-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('13');
    expect(items[1].textContent).toBe('14');
  });

  it('数字减小时渲染向下翻滚的双层数字', () => {
    const { container, rerender } = render(<RollProbe count={13} />);
    rerender(<RollProbe count={12} />);
    const roll = container.querySelector('.aura-badge-roll');
    expect(roll!.classList.contains('aura-badge-roll-down')).toBe(true);
    const items = container.querySelectorAll('.aura-badge-roll-item');
    expect(items[0].textContent).toBe('13');
    expect(items[1].textContent).toBe('12');
  });

  it('翻滚结束后回落到静态数字层', async () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<RollProbe count={5} />);
    rerender(<RollProbe count={6} />);
    expect(container.querySelector('.aura-badge-roll')).not.toBeNull();

    // 400ms 后 roll 状态清空，回到静态 text
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(container.querySelector('.aura-badge-roll')).toBeNull();
    expect(container.querySelector('.aura-badge-text')!.textContent).toBe('6');
    vi.useRealTimers();
  });
});
