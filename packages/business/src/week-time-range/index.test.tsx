import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { WeekTimeRange } from './index';
import type { WeekTimeRangeValue } from './index';

const emptyValue = (): WeekTimeRangeValue =>
  Array.from({ length: 7 }, () => []);

const cell = (container: HTMLElement, slot: string) =>
  container.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

/**
 * 30 分钟粒度下：slot index 18 = 09:00-09:30，19 = 09:30-10:00，20 = 10:00-10:30
 */
const SLOT_0900 = '0-18';
const SLOT_0930 = '0-19';

describe('WeekTimeRange', () => {
  // ---- 正常 ----
  it('正常：渲染 7 行星期标签与 48 个时间槽', () => {
    const { container, getByText } = render(<WeekTimeRange />);
    expect(container.querySelector('.aura-week-time-range')).not.toBeNull();
    expect(getByText('周一')).toBeDefined();
    expect(getByText('周日')).toBeDefined();
    expect(container.querySelectorAll('[data-slot]').length).toBe(7 * 48);
  });

  it('正常：单击单元格后回调选中该时段', () => {
    const onChange = vi.fn();
    const { container } = render(<WeekTimeRange onChange={onChange} />);
    fireEvent.click(cell(container, SLOT_0900));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0][0]).toEqual([
      { start: '09:00', end: '09:30' },
    ]);
  });

  it('正常：真实单击序列（mousedown → mouseup → click）只切换一次', () => {
    // 回归：mouseup 的框选逻辑与 click 会重复切换同一时段而相互抵消，
    // 表现为「点了没反应」。此处锁定该场景。
    const onChange = vi.fn();
    const { container } = render(<WeekTimeRange onChange={onChange} />);
    const target = cell(container, SLOT_0900);
    fireEvent.mouseDown(target);
    fireEvent.mouseUp(target);
    fireEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0][0]).toEqual([
      { start: '09:00', end: '09:30' },
    ]);
  });

  it('正常：相邻时段自动合并为一个区间', () => {
    const onChange = vi.fn();
    const { container } = render(<WeekTimeRange onChange={onChange} />);
    fireEvent.click(cell(container, SLOT_0900));
    fireEvent.click(cell(container, SLOT_0930));
    const last = onChange.mock.calls.at(-1)![0] as WeekTimeRangeValue;
    expect(last[0]).toEqual([{ start: '09:00', end: '10:00' }]);
  });

  it('正常：再次点击可取消该时段选中', () => {
    const onChange = vi.fn();
    const { container } = render(<WeekTimeRange onChange={onChange} />);
    fireEvent.click(cell(container, SLOT_0900));
    fireEvent.click(cell(container, SLOT_0900));
    const last = onChange.mock.calls.at(-1)![0] as WeekTimeRangeValue;
    expect(last[0]).toEqual([]);
  });

  it('正常：底部摘要展示已选时段', () => {
    const { getByText } = render(
      <WeekTimeRange
        defaultValue={[[{ start: '09:00', end: '10:00' }], [], [], [], [], [], []]}
      />,
    );
    expect(getByText('已选择 1 天的时间段')).toBeDefined();
    expect(getByText('09:00-10:00')).toBeDefined();
  });

  // ---- 边界 ----
  it('边界：从已选区间中间挖掉会拆分为两段', () => {
    const onChange = vi.fn();
    const { container } = render(
      <WeekTimeRange
        defaultValue={[
          [{ start: '09:00', end: '11:00' }],
          [],
          [],
          [],
          [],
          [],
          [],
        ]}
        onChange={onChange}
      />,
    );
    fireEvent.click(cell(container, SLOT_0930)); // 09:30-10:00 落在区间中部
    const last = onChange.mock.calls.at(-1)![0] as WeekTimeRangeValue;
    expect(last[0]).toEqual([
      { start: '09:00', end: '09:30' },
      { start: '10:00', end: '11:00' },
    ]);
  });

  it('边界：点击清空重置全部选择', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <WeekTimeRange
        defaultValue={[[{ start: '09:00', end: '10:00' }], [], [], [], [], [], []]}
        onChange={onChange}
      />,
    );
    fireEvent.click(getByText('清空'));
    const last = onChange.mock.calls.at(-1)![0] as WeekTimeRangeValue;
    expect(last.every((ranges) => ranges.length === 0)).toBe(true);
  });

  it('边界：受控模式下点击不改变自身渲染，仅回调', () => {
    const onChange = vi.fn();
    const { container } = render(
      <WeekTimeRange value={emptyValue()} onChange={onChange} />,
    );
    const target = cell(container, SLOT_0900);
    fireEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(
      target.classList.contains('aura-week-time-range-cell-selected'),
    ).toBe(false);
  });

  it('边界：weekStartsOn=0 时第一行为周日', () => {
    const { container } = render(<WeekTimeRange weekStartsOn={0} />);
    expect(
      container.querySelector('.aura-week-time-range-week')?.textContent,
    ).toBe('周日');
  });

  it('边界：stepMinutes=60 时时间槽减半', () => {
    const { container } = render(<WeekTimeRange stepMinutes={60} />);
    expect(container.querySelectorAll('[data-slot]').length).toBe(7 * 24);
  });

  it('边界：disabled 时点击不触发回调', () => {
    const onChange = vi.fn();
    const { container } = render(
      <WeekTimeRange disabled onChange={onChange} />,
    );
    fireEvent.click(cell(container, SLOT_0900));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('边界：showSummary=false 时不渲染摘要区', () => {
    const { container } = render(<WeekTimeRange showSummary={false} />);
    expect(container.querySelector('.aura-week-time-range-summary')).toBeNull();
  });

  it('边界：cellWidth / cellHeight 注入 CSS 变量', () => {
    const { container } = render(
      <WeekTimeRange cellWidth={16} cellHeight={30} />,
    );
    const root = container.querySelector(
      '.aura-week-time-range',
    ) as HTMLElement;
    expect(root.style.getPropertyValue('--aura-wtr-cell-width')).toBe('16px');
    expect(root.style.getPropertyValue('--aura-wtr-cell-height')).toBe('30px');
  });

  it('边界：cellWidth 支持任意 CSS 长度字符串', () => {
    const { container } = render(<WeekTimeRange cellWidth="1em" />);
    const root = container.querySelector(
      '.aura-week-time-range',
    ) as HTMLElement;
    expect(root.style.getPropertyValue('--aura-wtr-cell-width')).toBe('1em');
  });

  // ---- 异常 ----
  it('异常：未传 onChange 时点击不崩溃', () => {
    const { container } = render(<WeekTimeRange />);
    expect(() => fireEvent.click(cell(container, SLOT_0900))).not.toThrow();
  });

  it('异常：defaultValue 为空数组时不崩溃', () => {
    expect(() => render(<WeekTimeRange defaultValue={[]} />)).not.toThrow();
  });

  it('异常：defaultValue 缺少某天时按空处理', () => {
    const { container } = render(
      <WeekTimeRange defaultValue={[[{ start: '09:00', end: '10:00' }]]} />,
    );
    expect(container.querySelectorAll('[data-slot]').length).toBe(7 * 48);
  });
});
