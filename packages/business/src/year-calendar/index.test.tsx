import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { YearCalendar } from './index';

const day = (container: HTMLElement, date: string) =>
  container.querySelector(`[data-date="${date}"]`) as HTMLElement;

describe('YearCalendar', () => {
  // ---- 正常 ----
  it('正常：渲染年份标题与 12 个月份标签', () => {
    const { container } = render(<YearCalendar year={2026} />);
    expect(
      container.querySelector('.aura-year-calendar-title')?.textContent,
    ).toBe('2026年');
    expect(
      container.querySelectorAll('.aura-year-calendar-month-label').length,
    ).toBe(12);
  });

  it('正常：平年渲染 365 个日期格', () => {
    const { container } = render(<YearCalendar year={2026} />);
    expect(container.querySelectorAll('[data-date]').length).toBe(365);
  });

  it('正常：点击日期触发回调并输出该日期', () => {
    const onChange = vi.fn();
    const { container } = render(
      <YearCalendar year={2026} onChange={onChange} />,
    );
    fireEvent.click(day(container, '2026-03-10'));
    expect(onChange).toHaveBeenCalledWith(['2026-03-10']);
  });

  it('正常：真实单击序列（mousedown → mouseup → click）只切换一次', () => {
    // 回归：mouseup 的框选逻辑与 click 会重复切换同一日期而相互抵消，
    // 表现为「点了没反应」。此处锁定该场景。
    const onChange = vi.fn();
    const { container } = render(
      <YearCalendar year={2026} onChange={onChange} />,
    );
    const target = day(container, '2026-03-10');
    fireEvent.mouseDown(target);
    fireEvent.mouseUp(target);
    fireEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual(['2026-03-10']);
  });

  it('正常：真实单击序列可正确取消选中', () => {
    const onChange = vi.fn();
    const { container } = render(
      <YearCalendar
        year={2026}
        defaultValue={['2026-03-10']}
        onChange={onChange}
      />,
    );
    const target = day(container, '2026-03-10');
    fireEvent.mouseDown(target);
    fireEvent.mouseUp(target);
    fireEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual([]);
  });

  it('正常：再次点击同一日期可取消', () => {
    const onChange = vi.fn();
    const { container } = render(
      <YearCalendar year={2026} onChange={onChange} />,
    );
    fireEvent.click(day(container, '2026-03-10'));
    fireEvent.click(day(container, '2026-03-10'));
    expect(onChange.mock.calls.at(-1)![0]).toEqual([]);
  });

  it('正常：children 函数接收已选日期', () => {
    const { getByText } = render(
      <YearCalendar
        year={2026}
        defaultValue={['2026-01-01', '2026-02-02']}
      >
        {(dates) => <span>已选 {dates.length} 天</span>}
      </YearCalendar>,
    );
    expect(getByText('已选 2 天')).toBeDefined();
  });

  it('正常：选中态写入 aria-checked 便于无障碍识别', () => {
    const { container } = render(
      <YearCalendar year={2026} defaultValue={['2026-03-10']} />,
    );
    expect(day(container, '2026-03-10').getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(day(container, '2026-03-11').getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  // ---- 边界 ----
  it('边界：闰年渲染 366 个日期格', () => {
    const { container } = render(<YearCalendar year={2024} />);
    expect(container.querySelectorAll('[data-date]').length).toBe(366);
  });

  it('边界：切换年份后日期总数同步更新', () => {
    const { container, rerender } = render(<YearCalendar year={2025} />);
    expect(container.querySelectorAll('[data-date]').length).toBe(365);
    rerender(<YearCalendar year={2024} />);
    expect(container.querySelectorAll('[data-date]').length).toBe(366);
  });

  it('边界：hideYearTitle 时隐藏年份标题', () => {
    const { container } = render(<YearCalendar year={2026} hideYearTitle />);
    expect(container.querySelector('.aura-year-calendar-title')).toBeNull();
  });

  it('边界：cellSize 数字注入 CSS 变量（px）', () => {
    const { container } = render(<YearCalendar year={2026} cellSize={20} />);
    const root = container.querySelector(
      '.aura-year-calendar',
    ) as HTMLElement;
    expect(root.style.getPropertyValue('--aura-yc-cell')).toBe('20px');
  });

  it('边界：cellSize 支持任意 CSS 长度字符串', () => {
    const { container } = render(<YearCalendar year={2026} cellSize="1.2em" />);
    const root = container.querySelector(
      '.aura-year-calendar',
    ) as HTMLElement;
    expect(root.style.getPropertyValue('--aura-yc-cell')).toBe('1.2em');
  });

  it('边界：monthLabels 自定义生效', () => {
    const { getByText } = render(
      <YearCalendar
        year={2026}
        monthLabels={Array.from({ length: 12 }, (_, i) => `M${i + 1}`)}
      />,
    );
    expect(getByText('M1')).toBeDefined();
    expect(getByText('M12')).toBeDefined();
  });

  it('边界：受控模式下点击不改变自身选中态', () => {
    const onChange = vi.fn();
    const { container } = render(
      <YearCalendar year={2026} value={[]} onChange={onChange} />,
    );
    const target = day(container, '2026-03-10');
    fireEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(target.getAttribute('aria-checked')).toBe('false');
  });

  it('边界：选中结果按日期升序输出', () => {
    const onChange = vi.fn();
    const { container } = render(
      <YearCalendar year={2026} onChange={onChange} />,
    );
    fireEvent.click(day(container, '2026-09-01'));
    fireEvent.click(day(container, '2026-01-01'));
    expect(onChange.mock.calls.at(-1)![0]).toEqual([
      '2026-01-01',
      '2026-09-01',
    ]);
  });

  // ---- 异常 ----
  it('异常：未传 onChange 时点击不崩溃', () => {
    const { container } = render(<YearCalendar year={2026} />);
    expect(() =>
      fireEvent.click(day(container, '2026-01-01')),
    ).not.toThrow();
  });

  it('异常：defaultValue 为空数组时不崩溃', () => {
    expect(() =>
      render(<YearCalendar year={2026} defaultValue={[]} />),
    ).not.toThrow();
  });

  it('异常：传入非法年份字符串不崩溃', () => {
    expect(() =>
      render(<YearCalendar year={Number('  ')} />),
    ).not.toThrow();
  });
});
