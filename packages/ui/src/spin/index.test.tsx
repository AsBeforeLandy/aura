import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { Spin } from './index';

// ============================================================
// 辅助函数
// ============================================================
const getFirstChild = (container: HTMLElement) =>
  container.firstChild as HTMLDivElement;

describe('Spin', () => {
  // ----- 基础渲染 -----
  it('should render default spinner with correct classes', () => {
    const { container } = render(<Spin />);
    const spin = getFirstChild(container);
    expect(spin.classList.contains('aura-spin')).toBe(true);
    expect(spin.classList.contains('aura-spin-md')).toBe(true);
  });

  it('should render with size className variants', () => {
    (['sm', 'md', 'lg'] as const).forEach((size) => {
      const { unmount, container } = render(<Spin size={size} />);
      const spin = getFirstChild(container);
      expect(spin.classList.contains(`aura-spin-${size}`)).toBe(true);
      unmount();
    });
  });

  it('should render tip text', () => {
    const { getByText } = render(<Spin tip="加载中..." />);
    expect(getByText('加载中...')).toBeDefined();
  });

  it('should render custom indicator', () => {
    const customIndicator = <span data-testid="custom-icon">Loading</span>;
    const { getByTestId } = render(<Spin indicator={customIndicator} />);
    expect(getByTestId('custom-icon')).toBeDefined();
  });

  it('should render SVG indicator by default', () => {
    const { container } = render(<Spin />);
    const svg = container.querySelector('.aura-spin-svg');
    expect(svg).toBeDefined();
    expect(svg?.tagName).toBe('svg');
  });

  // ----- spinning = false 时无 children -----
  it('should add hidden class when spinning is false without children', () => {
    const { container } = render(<Spin spinning={false} />);
    const spin = getFirstChild(container);
    expect(spin.classList.contains('aura-spin-hidden')).toBe(true);
  });

  // ----- 包裹 children -----
  it('should render children when spinning is false', () => {
    const { getByText, container } = render(
      <Spin spinning={false}>
        <div>内容区域</div>
      </Spin>,
    );
    expect(getByText('内容区域')).toBeDefined();
    const spinContainer = getFirstChild(container);
    expect(spinContainer.classList.contains('aura-spin-container')).toBe(true);
    const overlay = spinContainer.querySelector('.aura-spin-overlay');
    expect(overlay).toBeNull();
  });

  it('should render overlay and blur children when spinning', () => {
    const { container } = render(
      <Spin spinning>
        <div>内容区域</div>
      </Spin>,
    );
    const spinContainer = getFirstChild(container);
    expect(spinContainer.classList.contains('aura-spin-spinning')).toBe(true);
    const overlay = spinContainer.querySelector('.aura-spin-overlay');
    expect(overlay).toBeDefined();
    const content = spinContainer.querySelector('.aura-spin-content-blur');
    expect(content).toBeDefined();
  });

  it('should not show overlay when spinning is false with children', () => {
    const { container } = render(
      <Spin spinning={false}>
        <div>内容</div>
      </Spin>,
    );
    const overlay = container.querySelector('.aura-spin-overlay');
    expect(overlay).toBeNull();
    const blurContent = container.querySelector('.aura-spin-content-blur');
    expect(blurContent).toBeNull();
  });

  it('should merge custom className', () => {
    const { container } = render(<Spin className="custom-class" />);
    const spin = getFirstChild(container);
    expect(spin.classList.contains('custom-class')).toBe(true);
  });

  it('should not have spinning container class when spinning is false with children', () => {
    const { container } = render(
      <Spin spinning={false}>
        <div>内容</div>
      </Spin>,
    );
    const wrapper = getFirstChild(container);
    expect(wrapper.classList.contains('aura-spin-spinning')).toBe(false);
  });

  // ----- ARIA 无障碍 -----
  it('should have role="status" on standalone spinner', () => {
    const { container } = render(<Spin />);
    const spin = getFirstChild(container);
    expect(spin.getAttribute('role')).toBe('status');
  });

  it('should have role="status" on overlay', () => {
    const { container } = render(
      <Spin spinning>
        <div>content</div>
      </Spin>,
    );
    const overlay = container.querySelector('.aura-spin-overlay');
    expect(overlay?.getAttribute('role')).toBe('status');
  });

  it('should set aria-label from tip string', () => {
    const { container } = render(<Spin tip="数据加载中" />);
    const spin = getFirstChild(container);
    expect(spin.getAttribute('aria-label')).toBe('数据加载中');
  });

  it('should set aria-busy on content when spinning', () => {
    const { container } = render(
      <Spin spinning>
        <div>content</div>
      </Spin>,
    );
    const content = container.querySelector('.aura-spin-content');
    expect(content?.getAttribute('aria-busy')).toBe('true');
  });

  it('should not set aria-busy when not spinning', () => {
    const { container } = render(
      <Spin spinning={false}>
        <div>content</div>
      </Spin>,
    );
    const content = container.querySelector('.aura-spin-content');
    expect(content?.getAttribute('aria-busy')).toBe('false');
  });

  // ----- delay -----
  it('should show spinner immediately when delay is 0', () => {
    const { container } = render(<Spin delay={0} />);
    const overlay = container.querySelector('.aura-spin-overlay');
    // 无 children 时直接渲染内容，不隐藏
    const spin = getFirstChild(container);
    expect(spin.classList.contains('aura-spin-hidden')).toBe(false);
  });

  it('should not show spinner during delay period', () => {
    vi.useFakeTimers();
    const { container } = render(<Spin delay={500} />);
    // 独立模式下在 delay 期间应该被隐藏
    const spin = getFirstChild(container);
    expect(spin.classList.contains('aura-spin-hidden')).toBe(true);
    vi.useRealTimers();
  });

  it('should show spinner after delay period', () => {
    vi.useFakeTimers();
    const { container } = render(<Spin delay={300} />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    const spin = getFirstChild(container);
    expect(spin.classList.contains('aura-spin-hidden')).toBe(false);
    vi.useRealTimers();
  });

  it('should respect delay when spinning is true with children', () => {
    vi.useFakeTimers();
    const { container } = render(
      <Spin spinning delay={200}>
        <div>content</div>
      </Spin>,
    );
    // delay 期间不应显示 overlay
    let overlay = container.querySelector('.aura-spin-overlay');
    expect(overlay).toBeNull();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    overlay = container.querySelector('.aura-spin-overlay');
    expect(overlay).toBeDefined();
    vi.useRealTimers();
  });

  it('should clear timeout on unmount during delay', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(window, 'clearTimeout');
    const { unmount } = render(<Spin delay={500} />);
    unmount();
    // 应该清除了 setTimeout
    expect(clearSpy).toHaveBeenCalled();
    vi.useRealTimers();
    clearSpy.mockRestore();
  });

  // ----- variant -----
  it('should render dot indicator when variant is dot', () => {
    const { container } = render(<Spin variant="dot" />);
    const dotContainer = container.querySelector('.aura-spin-dot');
    expect(dotContainer).toBeDefined();
    const dotItems = container.querySelectorAll('.aura-spin-dot-item');
    expect(dotItems.length).toBe(3);
  });

  it('should render default SVG indicator when variant is default', () => {
    const { container } = render(<Spin variant="default" />);
    const svg = container.querySelector('.aura-spin-svg');
    expect(svg).toBeDefined();
  });

  // ----- forwardRef -----
  it('should forward ref to root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Spin ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
