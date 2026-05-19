import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import React from 'react';
import { Popconfirm } from './index';

describe('Popconfirm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===== 基础渲染 =====
  it('should render children element', () => {
    render(
      <Popconfirm title="确认删除？">
        <button>删除</button>
      </Popconfirm>,
    );
    expect(screen.getByText('删除')).toBeDefined();
  });

  it('should render wrapper with correct className', () => {
    const { container } = render(
      <Popconfirm title="确认" className="custom-class">
        <button>按钮</button>
      </Popconfirm>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-popconfirm-wrapper')).toBe(true);
    expect(wrapper.classList.contains('custom-class')).toBe(true);
  });

  it('should apply custom style', () => {
    const { container } = render(
      <Popconfirm title="确认" style={{ display: 'block' }}>
        <button>按钮</button>
      </Popconfirm>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect((wrapper as HTMLElement).style.display).toBe('block');
  });

  // ===== 点击弹出气泡 =====
  it('should show popconfirm on click', () => {
    const { container } = render(
      <Popconfirm title="确认操作？">
        <button>点击</button>
      </Popconfirm>,
    );

    const button = screen.getByText('点击');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const pop = container.querySelector('.aura-popconfirm');
    expect(pop).not.toBeNull();
    expect(screen.getByText('确认操作？')).toBeDefined();
  });

  // ===== 确认回调 =====
  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <Popconfirm title="确认？" onConfirm={onConfirm}>
        <button>操作</button>
      </Popconfirm>,
    );

    const button = screen.getByText('操作');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const confirmBtn = screen.getByText('确定');
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // ===== 取消回调 =====
  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <Popconfirm title="确认？" onCancel={onCancel}>
        <button>操作</button>
      </Popconfirm>,
    );

    const button = screen.getByText('操作');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const cancelBtn = screen.getByText('取消');
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ===== 自定义按钮文字 =====
  it('should render custom okText and cancelText', () => {
    render(
      <Popconfirm title="确认？" okText="Yes" cancelText="No">
        <button>操作</button>
      </Popconfirm>,
    );

    const button = screen.getByText('操作');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('Yes')).toBeDefined();
    expect(screen.getByText('No')).toBeDefined();
  });

  // ===== 变体样式 =====
  it('should apply variant className', () => {
    const { container } = render(
      <Popconfirm title="确认？" variant="warning">
        <button>操作</button>
      </Popconfirm>,
    );

    const button = screen.getByText('操作');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const pop = container.querySelector('.aura-popconfirm');
    expect(pop?.classList.contains('aura-popconfirm-warning')).toBe(true);
  });

  // ===== 方位 =====
  it('should apply placement className', () => {
    const placements = ['top', 'bottom', 'left', 'right'] as const;
    placements.forEach((placement) => {
      const { unmount, container } = render(
        <Popconfirm title="确认？" placement={placement}>
          <button>按钮</button>
        </Popconfirm>,
      );
      const button = screen.getByText('按钮');
      fireEvent.click(button);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      const pop = container.querySelector('.aura-popconfirm');
      expect(pop?.classList.contains(`aura-popconfirm-${placement}`)).toBe(true);
      unmount();
    });
  });

  // ===== 禁用 =====
  it('should not show popconfirm when disabled', () => {
    const { container } = render(
      <Popconfirm title="确认？" disabled>
        <button>按钮</button>
      </Popconfirm>,
    );

    const button = screen.getByText('按钮');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container.querySelector('.aura-popconfirm')).toBeNull();
  });

  // ===== 描述 =====
  it('should render description when provided', () => {
    render(
      <Popconfirm title="确认删除？" description="此操作不可撤销">
        <button>删除</button>
      </Popconfirm>,
    );

    const button = screen.getByText('删除');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('此操作不可撤销')).toBeDefined();
  });

  // ===== 点击外部关闭 =====
  it('should close when clicking outside', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <div>
        <div data-testid="outside">外部区域</div>
        <Popconfirm title="确认？" onCancel={onCancel}>
          <button>操作</button>
        </Popconfirm>
      </div>,
    );

    const button = screen.getByText('操作');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(container.querySelector('.aura-popconfirm')).not.toBeNull();

    // 点击外部
    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ===== 动画类名 =====
  it('should add visible className when animating', () => {
    const { container } = render(
      <Popconfirm title="确认？">
        <button>按钮</button>
      </Popconfirm>,
    );

    const button = screen.getByText('按钮');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const pop = container.querySelector('.aura-popconfirm');
    expect(pop?.classList.contains('aura-popconfirm-visible')).toBe(true);
  });

  // ===== forwardRef =====
  it('should forward ref to wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Popconfirm title="确认" ref={ref}>
        <button>按钮</button>
      </Popconfirm>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-popconfirm-wrapper')).toBe(true);
  });
});
