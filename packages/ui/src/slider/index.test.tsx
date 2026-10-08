import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import { Slider } from './index';

/** jsdom 的 PointerEvent 无法在构造后写入 clientX，手动派发带坐标的原生事件（需 act 包裹冲刷状态更新） */
function firePointerMove(clientX: number) {
  const moveEvent = new Event('pointermove', { bubbles: true });
  Object.defineProperty(moveEvent, 'clientX', { value: clientX });
  act(() => {
    document.dispatchEvent(moveEvent);
  });
}

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
    // aria-disabled 跟随 role 落在滑块本体上
    const handle = container.querySelector('.aura-slider-handle');
    expect(handle?.getAttribute('aria-disabled')).toBe('true');
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
  // 注意：role="slider" 落在滑块本体（可聚焦元素）上，而不是外层容器。
  // 容器同时带 role="slider" 会与滑块重复表达同一语义，且容器无名称可用
  // （axe 的 aria-input-field-name 会报违规）。
  it('aria 属性应落在滑块本体上', () => {
    const { container } = render(<Slider min={0} max={100} value={50} />);
    const handle = container.querySelector('.aura-slider-handle');
    expect(handle?.getAttribute('role')).toBe('slider');
    expect(handle?.getAttribute('aria-valuemin')).toBe('0');
    expect(handle?.getAttribute('aria-valuemax')).toBe('100');
    expect(handle?.getAttribute('aria-valuenow')).toBe('50');
  });

  it('外层容器不应承担 role="slider"', () => {
    const { container } = render(<Slider min={0} max={100} value={50} />);
    const slider = container.querySelector('.aura-slider');
    expect(slider?.getAttribute('role')).toBe(null);
  });

  it('应把 aria-label 传给滑块本体', () => {
    const { container } = render(<Slider value={50} aria-label="音量" />);
    const handle = container.querySelector('.aura-slider-handle');
    expect(handle?.getAttribute('aria-label')).toBe('音量');
  });

  it('range 模式下两个滑块的可访问名称应可区分', () => {
    const { container } = render(
      <Slider range defaultValue={[20, 60]} aria-label="价格区间" />,
    );
    const handles = container.querySelectorAll('.aura-slider-handle');
    expect(handles).toHaveLength(2);
    expect(handles[0].getAttribute('aria-label')).toBe('价格区间·最小值');
    expect(handles[1].getAttribute('aria-label')).toBe('价格区间·最大值');
  });

  // ===== 键盘调节 =====
  it('方向键应该按步长调整滑块值', () => {
    const { container } = render(
      <Slider defaultValue={50} step={1} aria-label="音量" />,
    );
    const handle = container.querySelector('.aura-slider-handle')!;
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle.getAttribute('aria-valuenow')).toBe('51');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(handle.getAttribute('aria-valuenow')).toBe('50');
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(handle.getAttribute('aria-valuenow')).toBe('51');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handle.getAttribute('aria-valuenow')).toBe('50');
  });

  it('PageUp / PageDown 应该按 10 倍步长调整', () => {
    const { container } = render(
      <Slider defaultValue={50} step={1} aria-label="音量" />,
    );
    const handle = container.querySelector('.aura-slider-handle')!;
    fireEvent.keyDown(handle, { key: 'PageUp' });
    expect(handle.getAttribute('aria-valuenow')).toBe('60');
    fireEvent.keyDown(handle, { key: 'PageDown' });
    expect(handle.getAttribute('aria-valuenow')).toBe('50');
  });

  it('Home / End 应该跳到最小 / 最大值', () => {
    const { container } = render(
      <Slider defaultValue={50} min={0} max={100} aria-label="音量" />,
    );
    const handle = container.querySelector('.aura-slider-handle')!;
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    fireEvent.keyDown(handle, { key: 'End' });
    expect(handle.getAttribute('aria-valuenow')).toBe('100');
  });

  it('键盘调节不应越界且禁用时不响应', () => {
    const { container } = render(
      <Slider defaultValue={100} min={0} max={100} aria-label="音量" />,
    );
    const handle = container.querySelector('.aura-slider-handle')!;
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle.getAttribute('aria-valuenow')).toBe('100');

    const disabled = render(
      <Slider disabled defaultValue={50} aria-label="音量" />,
    );
    const disabledHandle = disabled.container.querySelector(
      '.aura-slider-handle',
    )!;
    fireEvent.keyDown(disabledHandle, { key: 'ArrowRight' });
    expect(disabledHandle.getAttribute('aria-valuenow')).toBe('50');
  });

  it('range 模式下键盘应分别调整两个滑块且不交叉', () => {
    // end 手柄（独立渲染，start 保持 20）：左移 1，Home 夹到 start
    const endRender = render(
      <Slider range defaultValue={[20, 60]} aria-label="区间" />,
    );
    const endHandle = endRender.container.querySelectorAll(
      '.aura-slider-handle',
    )[1];
    fireEvent.keyDown(endHandle, { key: 'ArrowLeft' });
    expect(endHandle.getAttribute('aria-valuenow')).toBe('59');
    fireEvent.keyDown(endHandle, { key: 'Home' });
    expect(endHandle.getAttribute('aria-valuenow')).toBe('20');

    // start 手柄（独立渲染，end 保持 60）：右移 1，End 夹到 end
    const startRender = render(
      <Slider range defaultValue={[20, 60]} aria-label="区间" />,
    );
    const startHandle = startRender.container.querySelector(
      '.aura-slider-handle',
    )!;
    fireEvent.keyDown(startHandle, { key: 'ArrowRight' });
    expect(startHandle.getAttribute('aria-valuenow')).toBe('21');
    fireEvent.keyDown(startHandle, { key: 'End' });
    expect(startHandle.getAttribute('aria-valuenow')).toBe('60');
  });

  // ===== onChangeComplete =====
  it('键盘调节和轨道点击都应该触发 onChangeComplete', () => {
    const onChangeComplete = vi.fn();
    const { container } = render(
      <Slider
        defaultValue={50}
        min={0}
        max={100}
        onChangeComplete={onChangeComplete}
        aria-label="音量"
      />,
    );
    const handle = container.querySelector('.aura-slider-handle')!;
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onChangeComplete).toHaveBeenLastCalledWith(51);

    fireEvent.click(
      container.querySelector('.aura-slider-track')!,
      { clientX: 200 },
    );
    expect(onChangeComplete).toHaveBeenCalledTimes(2);
  });

  it('拖拽松开时应该触发 onChangeComplete', () => {
    const onChangeComplete = vi.fn();
    const { container } = render(
      <Slider
        defaultValue={0}
        min={0}
        max={100}
        onChangeComplete={onChangeComplete}
        aria-label="音量"
      />,
    );
    // jsdom 不做布局计算，把轨道 rect 固定为 [0,100]，clientX 即百分比值
    const track = container.querySelector('.aura-slider-track') as HTMLElement;
    const rectMock = vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      height: 10,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);
    const handle = container.querySelector('.aura-slider-handle')!;

    // Pointer Events：触屏与鼠标统一走 pointer 系列
    fireEvent.pointerDown(handle);
    firePointerMove(40);
    expect(handle.getAttribute('aria-valuenow')).toBe('40');
    fireEvent.pointerUp(document);

    expect(onChangeComplete).toHaveBeenLastCalledWith(40);
    rectMock.mockRestore();
  });

  it('拖拽中间过程持续触发 onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider defaultValue={0} min={0} max={100} onChange={onChange} />,
    );
    const track = container.querySelector('.aura-slider-track') as HTMLElement;
    const rectMock = vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      height: 10,
      right: 100,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);
    const handle = container.querySelector('.aura-slider-handle')!;
    fireEvent.pointerDown(handle);
    firePointerMove(30);
    firePointerMove(60);
    fireEvent.pointerUp(document);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(60);
    rectMock.mockRestore();
  });
});
