import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Slider } from './index';

describe('Slider', () => {
  afterEach(() => cleanup());

  // 基础渲染
  it('should render slider', () => {
    const { container } = render(<Slider />);
    expect(container.querySelector('.aura-slider')).not.toBeNull();
  });

  // 包含轨道和滑块
  it('should render track and handle', () => {
    const { container } = render(<Slider />);
    expect(container.querySelector('.aura-slider-track')).not.toBeNull();
    expect(container.querySelector('.aura-slider-handle')).not.toBeNull();
  });

  // 默认值
  it('should render with defaultValue', () => {
    const { container } = render(<Slider defaultValue={50} />);
    const handle = container.querySelector('.aura-slider-handle-end');
    expect(handle).not.toBeNull();
  });

  // 受控值
  it('should render with controlled value', () => {
    const { container } = render(<Slider value={75} />);
    const selected = container.querySelector('.aura-slider-track-selected');
    expect(selected).not.toBeNull();
  });

  // 禁用状态
  it('should apply disabled class', () => {
    const { container } = render(<Slider disabled />);
    const slider = container.querySelector('.aura-slider');
    expect(slider?.classList.contains('aura-slider-disabled')).toBe(true);
    expect(slider?.getAttribute('aria-disabled')).toBe('true');
  });

  // marks 显示
  it('should render marks', () => {
    const marks = {
      0: '0',
      25: '25%',
      50: '50%',
      75: '75%',
      100: '100%',
    };
    const { container, getByText } = render(<Slider marks={marks} />);
    expect(container.querySelector('.aura-slider-marks')).not.toBeNull();
    expect(getByText('50%')).toBeDefined();
    expect(getByText('0')).toBeDefined();
    expect(getByText('100%')).toBeDefined();
  });

  // range 模式渲染两个滑块
  it('should render two handles in range mode', () => {
    const { container } = render(<Slider range defaultValue={[20, 80]} />);
    const handles = container.querySelectorAll('.aura-slider-handle');
    expect(handles.length).toBe(2);
    expect(
      container.querySelector('.aura-slider-handle-start'),
    ).not.toBeNull();
    expect(container.querySelector('.aura-slider-handle-end')).not.toBeNull();
  });

  // range 模式选中区域
  it('should render selected track in range mode', () => {
    const { container } = render(<Slider range value={[30, 70]} />);
    const selected = container.querySelector('.aura-slider-track-selected');
    expect(selected).not.toBeNull();
  });

  // onChange 回调
  it('should call onChange on track click', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider onChange={onChange} />);
    const track = container.querySelector('.aura-slider-track')!;
    fireEvent.click(track, { clientX: 200 });
    expect(onChange).toHaveBeenCalled();
  });

  // 禁用时不触发 onChange
  it('should not call onChange when disabled', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider disabled onChange={onChange} />);
    const track = container.querySelector('.aura-slider-track')!;
    fireEvent.click(track);
    expect(onChange).not.toHaveBeenCalled();
  });

  // className 和 style
  it('should apply custom className and style', () => {
    const { container } = render(
      <Slider className="custom-slider" style={{ width: 300 }} />,
    );
    const slider = container.querySelector('.aura-slider') as HTMLElement;
    expect(slider.classList.contains('custom-slider')).toBe(true);
    expect(slider.style.width).toBe('300px');
  });

  // forwardRef 支持
  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Slider ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-slider')).toBe(true);
  });

  // displayName
  it('should have displayName', () => {
    expect(Slider.displayName).toBe('Slider');
  });

  // aria 属性
  it('should have correct aria attributes', () => {
    const { container } = render(<Slider min={0} max={100} value={50} />);
    const slider = container.querySelector('.aura-slider');
    expect(slider?.getAttribute('role')).toBe('slider');
    expect(slider?.getAttribute('aria-valuemin')).toBe('0');
    expect(slider?.getAttribute('aria-valuemax')).toBe('100');
    expect(slider?.getAttribute('aria-valuenow')).toBe('50');
  });
});
