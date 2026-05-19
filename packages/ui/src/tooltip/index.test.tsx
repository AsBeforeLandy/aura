import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import React from 'react';
import { Tooltip } from './index';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===== 基础渲染 =====
  it('should render children element', () => {
    const { container } = render(
      <Tooltip content="提示内容">
        <button>悬停我</button>
      </Tooltip>,
    );
    expect(screen.getByText('悬停我')).toBeDefined();
    // tooltip 初始不显示
    const tooltip = container.querySelector('.aura-tooltip');
    expect(tooltip).toBeNull();
  });

  it('should render wrapper with correct className', () => {
    const { container } = render(
      <Tooltip content="提示" className="custom-class">
        <button>按钮</button>
      </Tooltip>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-tooltip-wrapper')).toBe(true);
    expect(wrapper.classList.contains('custom-class')).toBe(true);
  });

  it('should apply custom style', () => {
    const { container } = render(
      <Tooltip content="提示" style={{ display: 'block' }}>
        <button>按钮</button>
      </Tooltip>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect((wrapper as HTMLElement).style.display).toBe('block');
  });

  // ===== Hover 触发 =====
  it('should show tooltip on mouseenter and hide on mouseleave', () => {
    const { container } = render(
      <Tooltip content="提示内容">
        <button>悬停我</button>
      </Tooltip>,
    );

    const button = screen.getByText('悬停我');

    // 鼠标移入 → 显示
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    let tooltip = container.querySelector('.aura-tooltip');
    expect(tooltip).not.toBeNull();
    expect(screen.getByText('提示内容')).toBeDefined();

    // 鼠标移出 → 隐藏
    fireEvent.mouseLeave(button);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    tooltip = container.querySelector('.aura-tooltip');
    expect(tooltip).toBeNull();
  });

  // ===== Click 触发 =====
  it('should toggle tooltip on click trigger', () => {
    const { container } = render(
      <Tooltip content="点击提示" trigger="click">
        <button>点击我</button>
      </Tooltip>,
    );

    const button = screen.getByText('点击我');

    // 第一次点击 → 显示
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container.querySelector('.aura-tooltip')).not.toBeNull();

    // 第二次点击 → 隐藏
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(container.querySelector('.aura-tooltip')).toBeNull();
  });

  // ===== Focus 触发 =====
  it('should show tooltip on focus and hide on blur', () => {
    const { container } = render(
      <Tooltip content="聚焦提示" trigger="focus">
        <input placeholder="输入框" />
      </Tooltip>,
    );

    const input = screen.getByPlaceholderText('输入框');

    // 聚焦 → 显示
    fireEvent.focus(input);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container.querySelector('.aura-tooltip')).not.toBeNull();

    // 失焦 → 隐藏
    fireEvent.blur(input);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(container.querySelector('.aura-tooltip')).toBeNull();
  });

  // ===== Placement =====
  it('should apply placement className', () => {
    const placements = ['top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
    placements.forEach((placement) => {
      const { unmount, container } = render(
        <Tooltip content="提示" placement={placement}>
          <button>按钮</button>
        </Tooltip>,
      );
      const button = screen.getByText('按钮');
      fireEvent.mouseEnter(button);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      const tooltip = container.querySelector('.aura-tooltip');
      expect(tooltip?.classList.contains(`aura-tooltip-${placement}`)).toBe(true);
      unmount();
    });
  });

  // ===== Disabled =====
  it('should not show tooltip when disabled', () => {
    const { container } = render(
      <Tooltip content="提示" disabled>
        <button>按钮</button>
      </Tooltip>,
    );

    const button = screen.getByText('按钮');
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container.querySelector('.aura-tooltip')).toBeNull();
  });

  // ===== Delay =====
  it('should delay showing tooltip', () => {
    const { container } = render(
      <Tooltip content="延迟提示" delay={300}>
        <button>按钮</button>
      </Tooltip>,
    );

    const button = screen.getByText('按钮');
    fireEvent.mouseEnter(button);

    // 未到延迟时间
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(container.querySelector('.aura-tooltip')).toBeNull();

    // 到达延迟时间
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(container.querySelector('.aura-tooltip')).not.toBeNull();
  });

  // ===== 无内容 =====
  it('should not render tooltip when content is empty', () => {
    const { container } = render(
      <Tooltip content={null}>
        <button>按钮</button>
      </Tooltip>,
    );

    const button = screen.getByText('按钮');
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container.querySelector('.aura-tooltip')).toBeNull();
  });

  // ===== 动画类名 =====
  it('should add visible className when animating', () => {
    const { container } = render(
      <Tooltip content="提示">
        <button>按钮</button>
      </Tooltip>,
    );

    const button = screen.getByText('按钮');
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const tooltip = container.querySelector('.aura-tooltip');
    expect(tooltip?.classList.contains('aura-tooltip-visible')).toBe(true);
  });

  // ===== forwardRef =====
  it('should forward ref to wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tooltip content="提示" ref={ref}>
        <button>按钮</button>
      </Tooltip>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-tooltip-wrapper')).toBe(true);
  });
});
