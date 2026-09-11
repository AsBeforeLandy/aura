import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { useDragSelect } from '../_internal/useDragSelect';
import type { DragRect, DragSelectMeta } from '../_internal/useDragSelect';
import './index.less';

export interface YearCalendarProps {
  /**
   * 年份
   * @default 当前年份
   */
  year?: number;
  /** 受控值：选中日期数组，元素格式 `YYYY-MM-DD` */
  value?: string[];
  /** 非受控默认值 */
  defaultValue?: string[];
  /** 值变化回调 */
  onChange?: (dates: string[]) => void;
  /**
   * 一周起始日：`1` 表示周一，`0` 表示周日
   * @default 1
   */
  weekStartsOn?: 0 | 1;
  /** 月份标签 */
  monthLabels?: string[];
  /**
   * 是否隐藏年份标题
   * @default false
   */
  hideYearTitle?: boolean;
  /**
   * 未选中单元格颜色
   * @default 'var(--aura-border)'
   */
  color?: string;
  /**
   * 选中单元格颜色
   * @default 'var(--aura-primary-700)'
   */
  selectedColor?: string;
  /**
   * 非本年日期（仅年初 / 年末凑整周用）的颜色
   * @default 'var(--aura-bg-tertiary)'
   */
  outsideColor?: string;
  /**
   * 自定义单元格尺寸（正方形边长）。数字按 px，也可传任意 CSS 长度（如 '1.2em'）
   * @default 13（由 CSS 变量 --aura-yc-cell 控制）
   */
  cellSize?: number | string;
  /** 星期标签（7 个，按 weekStartsOn 顺序） */
  weekLabels?: string[];
  /** 拖拽选区遮罩样式 */
  selectionStyle?: React.CSSProperties;
  /** 底部自定义内容，传函数时接收当前已选日期 */
  children?:
    | React.ReactNode
    | ((selectedDates: string[]) => React.ReactNode);
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
const WEEK_LABELS_MONDAY_FIRST = ['一', '二', '三', '四', '五', '六', '日'];
const WEEK_LABELS_SUNDAY_FIRST = ['日', '一', '二', '三', '四', '五', '六'];

/** 网格中的一个日期格 */
interface DayCell {
  /** `YYYY-MM-DD` */
  date: string;
  /** 是否属于相邻年份（仅年初 / 年末凑整周用） */
  outside: boolean;
}

/** 一列 = 一整周（7 天） */
type WeekColumn = DayCell[];

/** 某个月在网格中占据的列区间 */
interface MonthSpan {
  /** 月份索引 0-11 */
  month: number;
  /** 起始列（含） */
  start: number;
  /** 结束列（含） */
  end: number;
}

/** `Date` → `YYYY-MM-DD` */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 构建**全年连续**的周网格
 *
 * 与「按月分块」不同，这里把整年铺成一条不间断的「周 × 星期」网格：
 * 每列固定 7 格、且都落在真实的星期行上，因此不会出现任何空白位，
 * 也不存在「属于相邻月份」的无效单元格 —— 每个月之间天然无缝衔接。
 *
 * 仅 1 月 1 日之前、12 月 31 日之后（用于凑满首尾整周）的少数格子标记为 outside。
 */
function buildYearWeeks(
  year: number,
  weekStartsOn: 0 | 1,
): { weeks: WeekColumn[]; spans: MonthSpan[] } {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  // 回溯到「1 月 1 日所在周」的第一天
  const leading = (firstDay.getDay() - weekStartsOn + 7) % 7;
  const cursor = new Date(year, 0, 1 - leading);

  const weeks: WeekColumn[] = [];
  while (cursor <= lastDay) {
    const column: WeekColumn = [];
    for (let i = 0; i < 7; i += 1) {
      column.push({
        date: formatDate(cursor),
        outside: cursor.getFullYear() !== year,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(column);
  }

  // 统计每个月横跨的列区间
  const spanMap = new Map<number, MonthSpan>();
  weeks.forEach((column, col) => {
    column.forEach((cell) => {
      if (cell.outside) return;
      const month = Number(cell.date.slice(5, 7)) - 1;
      const exist = spanMap.get(month);
      if (exist) exist.end = col;
      else spanMap.set(month, { month, start: col, end: col });
    });
  });
  const spans = [...spanMap.values()].sort((a, b) => a.month - b.month);

  return { weeks, spans };
}

/**
 * YearCalendar — 年历选择器
 *
 * 把一整年铺成一张「周 × 星期」的连续网格，高信息密度、无空白位，
 * 适用于投票日、活动排期、值班表等需要「一眼看全年」的勾选场景。
 *
 * 支持单击切换与拖拽框选；选中结果以 `YYYY-MM-DD` 升序数组对外输出。
 */
export const YearCalendar = forwardRef<HTMLDivElement, YearCalendarProps>(
  (
    {
      year: yearProp,
      value,
      defaultValue,
      onChange,
      weekStartsOn = 1,
      monthLabels = MONTH_LABELS,
      hideYearTitle = false,
      color = 'var(--aura-border)',
      selectedColor = 'var(--aura-primary-700)',
      outsideColor = 'var(--aura-bg-tertiary)',
      cellSize,
      weekLabels,
      selectionStyle,
      children,
      className,
      style,
    },
    ref,
  ) => {
    const prefix = prefixCls('year-calendar');
    const gridRef = useRef<HTMLDivElement>(null);
    /** 拖拽结束后抑制紧随其后的 click，避免同一日期被切换两次 */
    const suppressClickRef = useRef(false);

    const year = yearProp ?? new Date().getFullYear();

    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState<string[]>(
      () => defaultValue ?? [],
    );
    const currentValue = isControlled ? value : innerValue;

    const selectedSet = useMemo(() => new Set(currentValue), [currentValue]);

    const { weeks, spans } = useMemo(
      () => buildYearWeeks(year, weekStartsOn),
      [year, weekStartsOn],
    );

    /**
     * 各月标签的实际位置：渲染后测量「月首列」的布局得出，
     * 因此无论格子尺寸 / 月份间隔如何调整，标签都能精确对齐。
     */
    const [labelPos, setLabelPos] = useState<
      Record<number, { left: number; width: number }>
    >({});

    useEffect(() => {
      const grid = gridRef.current;
      if (!grid) return;
      const cs = getComputedStyle(grid);
      const gap = parseFloat(cs.getPropertyValue('--aura-yc-gap')) || 2;
      const monthGap =
        parseFloat(cs.getPropertyValue('--aura-yc-month-gap')) || 0;

      const starts = Array.from(
        grid.querySelectorAll<HTMLElement>('[data-month]'),
      );
      const pos: Record<number, { left: number; width: number }> = {};
      starts.forEach((el, i) => {
        const month = Number(el.dataset.month);
        const left = el.offsetLeft;
        const next = starts[i + 1];
        const width = next
          ? next.offsetLeft - monthGap - gap - left
          : el.parentElement!.offsetWidth - left;
        pos[month] = { left, width };
      });
      setLabelPos(pos);
    }, [weeks, year, cellSize]);

    /** 自定义单元格尺寸：以 CSS 变量注入，矩阵与标签定位全部自动跟随 */
    const sizeVarStyle =
      cellSize != null
        ? ({
            '--aura-yc-cell':
              typeof cellSize === 'number' ? `${cellSize}px` : cellSize,
          } as React.CSSProperties)
        : undefined;

    const labels = useMemo(() => {
      if (weekLabels) return weekLabels;
      return weekStartsOn === 1
        ? WEEK_LABELS_MONDAY_FIRST
        : WEEK_LABELS_SUNDAY_FIRST;
    }, [weekLabels, weekStartsOn]);

    const commit = (next: string[]) => {
      if (!isControlled) setInnerValue(next);
      onChange?.(next);
    };

    /** 按日期升序输出，保证结果稳定可预期 */
    const sortDates = (dates: string[]) => [...dates].sort();

    const toggleDate = (date: string) => {
      const next = new Set(selectedSet);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      commit(sortDates([...next]));
    };

    /** 拖拽框选：用首个命中的日期决定本次是「选中」还是「取消」 */
    const handleDragSelect = (rect: DragRect, meta: DragSelectMeta) => {
      // 位移未超过阈值视为单击，交给单元格自身的 onClick 处理；
      // 否则同一日期会被拖拽逻辑与 click 各切换一次而相互抵消
      if (!meta.isDrag) return;

      // 真实拖拽后浏览器仍会补发一次 click，这里将其抑制
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      const gridEl = gridRef.current;
      if (!gridEl) return;
      const gridRect = gridEl.getBoundingClientRect();

      const hits: string[] = [];
      gridEl.querySelectorAll<HTMLElement>('[data-date]').forEach((cell) => {
        const cellRect = cell.getBoundingClientRect();
        const left = cellRect.left - gridRect.left;
        const top = cellRect.top - gridRect.top;
        const intersect =
          left + cellRect.width >= rect.left &&
          left <= rect.right &&
          top + cellRect.height >= rect.top &&
          top <= rect.bottom;
        if (intersect && cell.dataset.date) hits.push(cell.dataset.date);
      });
      if (!hits.length) return;

      const shouldSelect = !selectedSet.has(hits[0]);
      const next = new Set(selectedSet);
      hits.forEach((date) => {
        if (shouldSelect) next.add(date);
        else next.delete(date);
      });
      commit(sortDates([...next]));
    };

    const { overlayStyle, containerProps } = useDragSelect({
      containerRef: gridRef,
      onSelect: handleDragSelect,
      selectionStyle,
    });

    return (
      <div
        ref={ref}
        className={classNames(prefix, className)}
        style={{ ...sizeVarStyle, ...style }}
      >
        {!hideYearTitle && <h3 className={`${prefix}-title`}>{year}年</h3>}

        <div className={`${prefix}-scroll`}>
          <div className={`${prefix}-inner`}>
            {/* 月份标签：位置由实际布局测量得出（useEffect 测量月首列） */}
            <div className={`${prefix}-months`}>
              {spans.map((span) => {
                const pos = labelPos[span.month];
                return (
                  <div
                    key={span.month}
                    className={`${prefix}-month-label`}
                    style={
                      pos
                        ? { left: pos.left, width: pos.width }
                        : { visibility: 'hidden' }
                    }
                  >
                    {monthLabels[span.month]}
                  </div>
                );
              })}
            </div>

            <div className={`${prefix}-main`}>
              <div className={`${prefix}-weeks`}>
                {labels.map((label) => (
                  <div key={label} className={`${prefix}-week-label`}>
                    {label}
                  </div>
                ))}
              </div>

              <div
                ref={gridRef}
                className={`${prefix}-grid`}
                style={{ position: 'relative' }}
                {...containerProps}
              >
                {weeks.map((column, colIndex) => {
                  // 月首列（包含当月 1 号）：前方留出月份分组间隔
                  const firstOfMonth = column.find(
                    (c) => !c.outside && c.date.endsWith('-01'),
                  );
                  // 存月份索引（0-11），与 spans 的 month 对齐
                  const monthIndex = firstOfMonth
                    ? new Date(firstOfMonth.date).getMonth()
                    : -1;
                  return (
                    <div
                      key={colIndex}
                      className={`${prefix}-week`}
                      data-month={
                        monthIndex >= 0 ? monthIndex : undefined
                      }
                      style={{
                        marginLeft:
                          firstOfMonth && colIndex > 0
                            ? 'var(--aura-yc-month-gap)'
                            : 0,
                      }}
                    >
                      {column.map((cell) =>
                        cell.outside ? (
                          <div
                            key={cell.date}
                            className={`${prefix}-day ${prefix}-day-outside`}
                            style={{ backgroundColor: outsideColor }}
                            aria-hidden
                          />
                        ) : (
                          <div
                            key={cell.date}
                            data-date={cell.date}
                            role="checkbox"
                            aria-checked={selectedSet.has(cell.date)}
                            aria-label={cell.date}
                            title={cell.date}
                            className={classNames(
                              `${prefix}-day`,
                              selectedSet.has(cell.date) &&
                                `${prefix}-day-selected`,
                            )}
                            style={{
                              backgroundColor: selectedSet.has(cell.date)
                                ? selectedColor
                                : color,
                            }}
                            onClick={() => {
                              if (suppressClickRef.current) return;
                              toggleDate(cell.date);
                            }}
                          />
                        ),
                      )}
                    </div>
                  );
                })}
                <div className={`${prefix}-selection`} style={overlayStyle} />
              </div>
            </div>
          </div>
        </div>

        {(children || currentValue.length > 0) && (
          <div className={`${prefix}-extra`}>
            {typeof children === 'function'
              ? children(currentValue)
              : children}
          </div>
        )}
      </div>
    );
  },
);

YearCalendar.displayName = 'YearCalendar';
