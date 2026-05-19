import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Rate } from './index';

describe('Rate', () => {
  afterEach(() => cleanup());

  // 基础渲染：默认5颗星
  it('should render default 5 stars', () => {
    const { container } = render(<Rate />);
    const stars = container.querySelectorAll('.aura-rate-star');
    expect(stars.length).toBe(5);
  });

  // 自定义星星数量
  it('should render custom count of stars', () => {
    const { container } = render(<Rate count={10} />);
    const stars = container.querySelectorAll('.aura-rate-star');
    expect(stars.length).toBe(10);
  });

  // 默认值
  it('should render with defaultValue', () => {
    const { container } = render(<Rate defaultValue={3} />);
    const filled = container.querySelectorAll('.aura-rate-star-filled');
    expect(filled.length).toBe(3);
  });

  // 受控值
  it('should render with controlled value', () => {
    const { container } = render(<Rate value={4} />);
    const filled = container.querySelectorAll('.aura-rate-star-filled');
    expect(filled.length).toBe(4);
  });

  // 点击选择
  it('should call onChange when star is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<Rate onChange={onChange} />);
    const stars = container.querySelectorAll('.aura-rate-star');
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  // 半星模式：mock getBoundingClientRect 以模拟左半部分点击
  it('should support half star selection', () => {
    const onChange = vi.fn();
    const { container } = render(<Rate allowHalf onChange={onChange} />);
    const stars = container.querySelectorAll('.aura-rate-star');

    // Mock getBoundingClientRect 使第二颗星宽40px，left=40px
    const originalGetBoundingClientRect =
      HTMLSpanElement.prototype.getBoundingClientRect;
    HTMLSpanElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 40,
      height: 20,
      top: 0,
      right: 80,
      bottom: 20,
      left: 40,
      x: 40,
      y: 0,
      toJSON: () => {},
    }));

    // clientX=50 → 50-40=10 < 20(宽度一半)，判定为左半 → 1.5
    fireEvent.click(stars[1], { clientX: 50 });
    expect(onChange).toHaveBeenCalledWith(1.5);

    HTMLSpanElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  // 半星模式：模拟右半部分点击
  it('should select full star when clicking right half', () => {
    const onChange = vi.fn();
    const { container } = render(<Rate allowHalf onChange={onChange} />);
    const stars = container.querySelectorAll('.aura-rate-star');

    const originalGetBoundingClientRect =
      HTMLSpanElement.prototype.getBoundingClientRect;
    HTMLSpanElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 40,
      height: 20,
      top: 0,
      right: 80,
      bottom: 20,
      left: 40,
      x: 40,
      y: 0,
      toJSON: () => {},
    }));

    // clientX=70 → 70-40=30 > 20(宽度一半)，判定为右半 → 2
    fireEvent.click(stars[1], { clientX: 70 });
    expect(onChange).toHaveBeenCalledWith(2);

    HTMLSpanElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  // allowClear 清空
  it('should clear value when clicking same value with allowClear', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Rate value={3} allowClear onChange={onChange} />,
    );
    const stars = container.querySelectorAll('.aura-rate-star');
    // 点击第3颗星（索引2）
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  // 不允许清空时，点击当前值不会清零
  it('should not clear value without allowClear', () => {
    const onChange = vi.fn();
    const { container } = render(<Rate value={3} onChange={onChange} />);
    const stars = container.querySelectorAll('.aura-rate-star');
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  // 禁用状态
  it('should be disabled', () => {
    const { container } = render(<Rate disabled value={3} />);
    const rate = container.querySelector('.aura-rate');
    expect(rate?.classList.contains('aura-rate-disabled')).toBe(true);
    expect(rate?.getAttribute('aria-label')).toBe('评分');
  });

  // 禁用时不触发 onChange
  it('should not call onChange when disabled', () => {
    const onChange = vi.fn();
    const { container } = render(<Rate disabled onChange={onChange} />);
    const stars = container.querySelectorAll('.aura-rate-star');
    fireEvent.click(stars[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  // size 属性
  it('should apply size class', () => {
    const { container } = render(<Rate size="lg" />);
    const rate = container.querySelector('.aura-rate');
    expect(rate?.classList.contains('aura-rate-lg')).toBe(true);
  });

  // className 和 style
  it('should apply custom className and style', () => {
    const { container } = render(
      <Rate className="custom-rate" style={{ margin: 10 }} />,
    );
    const rate = container.querySelector('.aura-rate') as HTMLElement;
    expect(rate.classList.contains('custom-rate')).toBe(true);
    expect(rate.style.margin).toBe('10px');
  });

  // forwardRef 支持
  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Rate ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-rate')).toBe(true);
  });

  // displayName
  it('should have displayName', () => {
    expect(Rate.displayName).toBe('Rate');
  });

  // aria 属性
  it('should have correct aria attributes', () => {
    const { container } = render(<Rate value={3} />);
    const rate = container.querySelector('.aura-rate');
    expect(rate?.getAttribute('role')).toBe('radiogroup');
    expect(rate?.getAttribute('aria-label')).toBe('评分');

    const stars = container.querySelectorAll('.aura-rate-star');
    expect(stars[0].getAttribute('role')).toBe('radio');
    expect(stars[0].getAttribute('aria-label')).toBe('1 星');
    expect(stars[4].getAttribute('aria-label')).toBe('5 星');
  });

  // 星星包含 SVG
  it('should render SVG stars', () => {
    const { container } = render(<Rate />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(5);
  });
});
