import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { useDragSelect } from '../_internal/useDragSelect';
import type { DragRect, DragSelectMeta } from '../_internal/useDragSelect';
import {
  buildSlots,
  createEmptyValue,
  formatMinutes,
  isCovered,
  mergeRanges,
  subtractRange,
  WEEK_LABELS_MONDAY_FIRST,
  WEEK_LABELS_SUNDAY_FIRST,
} from './utils';
import type { WeekTimeRangeValue } from './utils';
import './index.less';

// 公开类型原先由本文件声明，现移至 utils.ts；此处保持导出不变
export type { TimeRange, WeekTimeRangeValue } from './utils';

export interface WeekTimeRangeProps {
  /** 受控值 */
  value?: WeekTimeRangeValue;
  /** 非受控默认值 */
  defaultValue?: WeekTimeRangeValue;
  /** 值变化回调 */
  onChange?: (value: WeekTimeRangeValue) => void;
  /**
   * 时间粒度（分钟），需能整除 60
   * @default 30
   */
  stepMinutes?: 15 | 30 | 60;
  /**
   * 一周起始日：`1` 表示周一，`0` 表示周日
   * @default 1
   */
  weekStartsOn?: 0 | 1;
  /** 自定义星期标签（按 weekStartsOn 顺序） */
  weekLabels?: string[];
  /**
   * 选中单元格颜色
   * @default 'var(--aura-primary-700)'
   */
  color?: string;
  /** 拖拽选区遮罩样式 */
  selectionStyle?: React.CSSProperties;
  /**
   * 自定义单元格宽度。数字按 px，也可传任意 CSS 长度
   * @default 11（由 CSS 变量 --aura-wtr-cell-width 控制）
   */
  cellWidth?: number | string;
  /**
   * 自定义单元格高度
   * @default 26（由 CSS 变量 --aura-wtr-cell-height 控制）
   */
  cellHeight?: number | string;
  /** 是否只读 */
  disabled?: boolean;
  /**
   * 是否显示底部已选摘要
   * @default true
   */
  showSummary?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * WeekTimeRange — 周时间段选择器
 *
 * 以「一周 × 时间粒度」的矩阵呈现可选时段，适用于排班、可预约时间、营业时间等场景。
 *
 * 支持两种选择方式：单击单元格切换，或按住鼠标拖拽框选一片区域。
 * 相邻时间段会自动合并为连续区间（如选中 09:00-09:30 与 09:30-10:00 → `09:00-10:00`）。
 */
export const WeekTimeRange = forwardRef<HTMLDivElement, WeekTimeRangeProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      stepMinutes = 30,
      weekStartsOn = 1,
      weekLabels,
      color = 'var(--aura-primary-700)',
      selectionStyle,
      cellWidth,
      cellHeight,
      disabled = false,
      showSummary = true,
      className,
      style,
    },
    ref,
  ) => {
    const prefix = prefixCls('week-time-range');
    const bodyRef = useRef<HTMLDivElement>(null);
    /** 拖拽结束后抑制紧随其后的 click，避免同一时段被切换两次 */
    const suppressClickRef = useRef(false);

    /** 自定义单元格尺寸：以 CSS 变量注入，矩阵与表头自动跟随 */
    const sizeVarStyle =
      cellWidth != null || cellHeight != null
        ? ({
            ...(cellWidth != null
              ? {
                  '--aura-wtr-cell-width':
                    typeof cellWidth === 'number'
                      ? `${cellWidth}px`
                      : cellWidth,
                }
              : null),
            ...(cellHeight != null
              ? {
                  '--aura-wtr-cell-height':
                    typeof cellHeight === 'number'
                      ? `${cellHeight}px`
                      : cellHeight,
                }
              : null),
          } as React.CSSProperties)
        : undefined;

    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState<WeekTimeRangeValue>(
      () => defaultValue ?? createEmptyValue(),
    );
    const currentValue: WeekTimeRangeValue = isControlled
      ? value
      : innerValue;

    const slots = useMemo(() => buildSlots(stepMinutes), [stepMinutes]);
    const slotsPerHour = 60 / stepMinutes;
    const halfSlots = slots.length / 2;

    const labels = useMemo(() => {
      if (weekLabels) return weekLabels;
      return weekStartsOn === 1
        ? WEEK_LABELS_MONDAY_FIRST
        : WEEK_LABELS_SUNDAY_FIRST;
    }, [weekLabels, weekStartsOn]);

    const commit = (next: WeekTimeRangeValue) => {
      if (!isControlled) setInnerValue(next);
      onChange?.(next);
    };

    /** 单击切换单个槽 */
    const toggleSlot = (dayIndex: number, slotIndex: number) => {
      if (disabled) return;
      const target: [number, number] = [
        slots[slotIndex].start,
        slots[slotIndex].end,
      ];
      const next = currentValue.map((ranges, i) => {
        if (i !== dayIndex) return ranges;
        return isCovered(ranges, target)
          ? subtractRange(ranges, target)
          : mergeRanges([
              ...ranges,
              {
                start: formatMinutes(target[0]),
                end: formatMinutes(target[1]),
              },
            ]);
      });
      commit(next);
    };

    /** 拖拽框选：用首个命中的槽决定本次是「选中」还是「取消」 */
    const handleDragSelect = (rect: DragRect, meta: DragSelectMeta) => {
      // 位移未超过阈值视为单击，交给单元格自身的 onClick 处理；
      // 否则同一时段会被拖拽逻辑与 click 各切换一次而相互抵消
      if (!meta.isDrag) return;

      // 真实拖拽后浏览器仍会补发一次 click，这里将其抑制
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      const bodyEl = bodyRef.current;
      if (!bodyEl) return;
      const bodyRect = bodyEl.getBoundingClientRect();

      const hits: Array<{ day: number; slot: number }> = [];
      bodyEl.querySelectorAll<HTMLElement>('[data-slot]').forEach((cell) => {
        const cellRect = cell.getBoundingClientRect();
        const left = cellRect.left - bodyRect.left;
        const top = cellRect.top - bodyRect.top;
        const intersect =
          left + cellRect.width >= rect.left &&
          left <= rect.right &&
          top + cellRect.height >= rect.top &&
          top <= rect.bottom;
        if (!intersect) return;
        const [day, slot] = (cell.dataset.slot ?? '').split('-').map(Number);
        hits.push({ day, slot });
      });
      if (!hits.length) return;

      const first = hits[0];
      const shouldSelect = !isCovered(currentValue[first.day] ?? [], [
        slots[first.slot].start,
        slots[first.slot].end,
      ]);

      const grouped = new Map<number, number[]>();
      hits.forEach(({ day, slot }) => {
        const list = grouped.get(day);
        if (list) list.push(slot);
        else grouped.set(day, [slot]);
      });

      const next = currentValue.map((ranges) => ranges);
      grouped.forEach((slotIndexes, day) => {
        let ranges = next[day] ?? [];
        if (shouldSelect) {
          ranges = mergeRanges([
            ...ranges,
            ...slotIndexes.map((i) => ({
              start: formatMinutes(slots[i].start),
              end: formatMinutes(slots[i].end),
            })),
          ]);
        } else {
          ranges = slotIndexes.reduce(
            (acc, i) => subtractRange(acc, [slots[i].start, slots[i].end]),
            ranges,
          );
        }
        next[day] = ranges;
      });
      commit(next);
    };

    const { overlayStyle, containerProps } = useDragSelect({
      containerRef: bodyRef,
      onSelect: handleDragSelect,
      disabled,
      selectionStyle,
    });

    const selectedDayCount = currentValue.filter(
      (ranges) => ranges.length > 0,
    ).length;

    // 列宽通过 CSS 变量暴露，可在外部覆盖调整（见 index.less）
    const gridStyle: React.CSSProperties = {
      gridTemplateColumns: `var(--aura-wtr-label-width) repeat(${slots.length}, var(--aura-wtr-cell-width))`,
    };

    return (
      <div
        ref={ref}
        className={classNames(
          prefix,
          disabled && `${prefix}-disabled`,
          className,
        )}
        style={{ ...sizeVarStyle, ...style }}
      >
        <div className={`${prefix}-scroll`}>
          <div className={`${prefix}-frame`}>
            {/* 统一网格：表头两行 + 7 个数据行共用一套行列轨道，间隔天然一致 */}
            <div
              ref={bodyRef}
              className={`${prefix}-matrix`}
              style={{ ...gridStyle, position: 'relative' }}
              {...containerProps}
            >
              {/* 表头行 1：角标签跨两行（与小时刻度行合并），文本居中 */}
              <div className={`${prefix}-corner`}>星期/时间</div>
              <div
                className={`${prefix}-half`}
                style={{ gridColumn: `span ${halfSlots}` }}
              >
                00:00-12:00
              </div>
              <div
                className={`${prefix}-half`}
                style={{ gridColumn: `span ${halfSlots}` }}
              >
                12:00-24:00
              </div>

              {/* 表头行 2：小时刻度（第 1 列已被角标签占据） */}
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className={`${prefix}-hour`}
                  style={{ gridColumn: `span ${slotsPerHour}` }}
                >
                  {hour}
                </div>
              ))}

              {/* 数据行：星期标签 + 时间格 */}
              {labels.map((label, dayIndex) => (
                <React.Fragment key={label}>
                  <div className={`${prefix}-week`}>{label}</div>
                  {slots.map((slot, slotIndex) => {
                    const selected = isCovered(
                      currentValue[dayIndex] ?? [],
                      [slot.start, slot.end],
                    );
                    return (
                      // 336 个格子若逐个包裹 Tooltip 会带来可观的组件实例开销，
                      // 改用原生 title 提示，功能等价且零渲染成本
                      <div
                        key={slot.label}
                        data-slot={`${dayIndex}-${slotIndex}`}
                        title={`${label} ${slot.label}`}
                        className={classNames(
                          `${prefix}-cell`,
                          selected && `${prefix}-cell-selected`,
                        )}
                        style={
                          selected
                            ? { backgroundColor: color }
                            : undefined
                        }
                        onClick={() => {
                          if (suppressClickRef.current) return;
                          toggleSlot(dayIndex, slotIndex);
                        }}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
              <div
                className={`${prefix}-selection`}
                style={overlayStyle}
              />
            </div>

            {/* 底部摘要（宽度与矩阵保持一致） */}
            {showSummary && (
              <div className={`${prefix}-summary`}>
                <div className={`${prefix}-summary-head`}>
                  <span>
                    {selectedDayCount
                      ? `已选择 ${selectedDayCount} 天的时间段`
                      : '可拖拽鼠标框选时间段'}
                  </span>
                  <button
                    type="button"
                    className={`${prefix}-clear`}
                    disabled={disabled || !selectedDayCount}
                    onClick={() => commit(createEmptyValue())}
                  >
                    清空
                  </button>
                </div>
                {currentValue.map(
                  (ranges, dayIndex) =>
                    ranges.length > 0 && (
                      <div
                        key={labels[dayIndex]}
                        className={`${prefix}-summary-row`}
                      >
                        <span className={`${prefix}-summary-label`}>
                          {labels[dayIndex]}：
                        </span>
                        <span>
                          {ranges
                            .map((r) => `${r.start}-${r.end}`)
                            .join('、')}
                        </span>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

WeekTimeRange.displayName = 'WeekTimeRange';
