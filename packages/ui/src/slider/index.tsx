import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SliderProps extends React.AriaAttributes {
  /** 最小值
   *  @default 0
   */
  min?: number;
  /** 最大值
   *  @default 100
   */
  max?: number;
  /** 步长
   *  @default 1
   */
  step?: number;
  /** 当前值（受控） */
  value?: number | [number, number];
  /** 默认值（非受控）
   *  @default 0
   */
  defaultValue?: number | [number, number];
  /** 是否禁用 */
  disabled?: boolean;
  /** 标记 */
  marks?: Record<number, React.ReactNode>;
  /** 是否为范围滑块 */
  range?: boolean;
  /** 值变化回调（拖拽 / 点击 / 键盘调节过程中持续触发） */
  onChange?: (value: number | [number, number]) => void;
  /** 一次调节结束后的回调（松开拖拽、轨道点击、单次键盘调节） */
  onChangeComplete?: (value: number | [number, number]) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 将值限制在 [min, max] 范围内 */
function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** 将值对齐到步长 */
function alignToStep(val: number, min: number, step: number): number {
  const steps = Math.round((val - min) / step);
  return min + steps * step;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue,
      disabled = false,
      marks,
      range = false,
      onChange,
      onChangeComplete,
      className,
      style,
      // role="slider" 落在滑块本体上，名称需由调用方通过 aria-* 提供
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    // 内部维护的值（非受控模式）
    const [internalValue, setInternalValue] = useState<number | [number, number]>(
      () => {
        if (defaultValue !== undefined) return defaultValue;
        return range ? [min, max] : min;
      },
    );

    // 当前生效的值
    const currentValue =
      controlledValue !== undefined ? controlledValue : internalValue;

    // 拖拽状态
    const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // 获取单个值对应的百分比
    const getPercent = useCallback(
      (val: number) => {
        const total = max - min;
        if (total === 0) return 0;
        return ((val - min) / total) * 100;
      },
      [min, max],
    );

    // 根据鼠标位置计算值
    const getValueFromPosition = useCallback(
      (clientX: number) => {
        if (!trackRef.current) return min;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
        const rawValue = min + percent * (max - min);
        return alignToStep(clamp(rawValue, min, max), min, step);
      },
      [min, max, step],
    );

    // 更新值
    const updateValue = useCallback(
      (newValue: number | [number, number]) => {
        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [controlledValue, onChange],
    );

    // 处理按下（Pointer Events：鼠标 / 触摸 / 触控笔统一处理）
    const handlePointerDown = useCallback(
      (e: React.PointerEvent, handle: 'start' | 'end') => {
        if (disabled) return;
        e.preventDefault();
        setDragging(handle);
      },
      [disabled],
    );

    // 键盘调节（方向键 ±step、PageUp/Down ±10step、Home/End 到两端）
    const stepValue = useCallback(
      (handle: 'start' | 'end', delta: number | 'min' | 'max') => {
        let next: number | [number, number];
        if (range) {
          const [start, end] = currentValue as [number, number];
          if (handle === 'start') {
            const target = delta === 'min' ? min : delta === 'max' ? end : start + delta;
            const newStart = clamp(alignToStep(clamp(target, min, end), min, step), min, end);
            next = [newStart, end];
          } else {
            const target = delta === 'min' ? start : delta === 'max' ? max : end + delta;
            const newEnd = clamp(alignToStep(clamp(target, start, max), min, step), start, max);
            next = [start, newEnd];
          }
        } else {
          const base = currentValue as number;
          const target = delta === 'min' ? min : delta === 'max' ? max : base + delta;
          next = alignToStep(clamp(target, min, max), min, step);
        }
        updateValue(next);
        onChangeComplete?.(next);
      },
      [currentValue, range, min, max, step, updateValue, onChangeComplete],
    );

    const makeHandleKeyDown = (handle: 'start' | 'end') =>
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const deltas: Record<string, number | 'min' | 'max'> = {
          ArrowLeft: -step,
          ArrowDown: -step,
          ArrowRight: step,
          ArrowUp: step,
          PageDown: -step * 10,
          PageUp: step * 10,
          Home: 'min',
          End: 'max',
        };
        const delta = deltas[e.key];
        if (delta === undefined) return;
        e.preventDefault();
        stepValue(handle, delta);
      };

    // 处理轨道点击（非拖拽）
    const handleTrackClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled || dragging) return;
        // 忽略来自滑块手柄的事件
        const target = e.target as HTMLElement;
        if (target.closest(`.${prefixCls('slider-handle')}`)) return;

        const newValue = getValueFromPosition(e.clientX);
        if (range) {
          const [start, end] = currentValue as [number, number];
          // 靠近哪个滑块就移动哪个
          const distStart = Math.abs(newValue - start);
          const distEnd = Math.abs(newValue - end);
          if (distStart <= distEnd) {
            updateValue([newValue, end]);
          } else {
            updateValue([start, newValue]);
          }
        } else {
          updateValue(newValue);
        }
        onChangeComplete?.(newValue);
      },
      [disabled, dragging, getValueFromPosition, currentValue, range, updateValue, onChangeComplete],
    );

    // 拖拽移动和松开事件（Pointer Events 覆盖鼠标与触摸）
    useEffect(() => {
      if (!dragging) return;

      const handlePointerMove = (e: PointerEvent) => {
        const newValue = getValueFromPosition(e.clientX);
        if (range) {
          const [start, end] = currentValue as [number, number];
          if (dragging === 'start') {
            const newStart = Math.min(newValue, end);
            updateValue([newStart, end]);
          } else {
            const newEnd = Math.max(newValue, start);
            updateValue([start, newEnd]);
          }
        } else {
          updateValue(newValue);
        }
      };

      const handlePointerUp = () => {
        setDragging(null);
        // 松开时提交最后一次更新（回调闭包随 currentValue 更新，此处值是新鲜的）
        onChangeComplete?.(currentValue);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
      };
    }, [dragging, getValueFromPosition, currentValue, range, updateValue, onChangeComplete]);

    // 获取当前展示值
    const startValue = range
      ? (currentValue as [number, number])[0]
      : (currentValue as number);
    const endValue = range
      ? (currentValue as [number, number])[1]
      : (currentValue as number);

    const startPercent = getPercent(startValue);
    const endPercent = getPercent(endValue);

    const cls = classNames(
      prefixCls('slider'),
      disabled && prefixCls('slider-disabled'),
      dragging && prefixCls('slider-dragging'),
      className,
    );

    // 渲染标记
    const renderMarks = () => {
      if (!marks) return null;
      const markKeys = Object.keys(marks)
        .map(Number)
        .sort((a, b) => a - b);

      return (
        <div className={prefixCls('slider-marks')}>
          {markKeys.map((markValue) => (
            <span
              key={markValue}
              className={classNames(
                prefixCls('slider-mark'),
                markValue >= startValue &&
                  markValue <= endValue &&
                  prefixCls('slider-mark-active'),
              )}
              style={{ left: `${getPercent(markValue)}%` }}
            >
              {marks[markValue]}
            </span>
          ))}
        </div>
      );
    };

    /** 滑块的可访问名称：range 模式下两个滑块需要彼此可区分 */
    const handleAriaLabel = (which: 'start' | 'end'): string | undefined => {
      if (!range) return ariaLabel;
      const suffix = which === 'start' ? '最小值' : '最大值';
      return ariaLabel ? `${ariaLabel}·${suffix}` : suffix;
    };

    return (
      // 容器不是可聚焦控件，不应承担 role="slider"：否则容器与滑块体会重复表达
      // 同一语义，且容器无名称可用（axe 报 aria-input-field-name）。语义交给滑块本体。
      <div ref={ref} className={cls} style={style}>
        <div
          ref={trackRef}
          className={prefixCls('slider-track')}
          onClick={handleTrackClick}
        >
          {/* 已选区域 */}
          <div
            className={prefixCls('slider-track-selected')}
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          {/* 起始滑块（range 模式） */}
          {range && (
            <div
              className={classNames(
                prefixCls('slider-handle'),
                prefixCls('slider-handle-start'),
                dragging === 'start' && prefixCls('slider-handle-active'),
              )}
              style={{ left: `${startPercent}%` }}
              onPointerDown={(e) => handlePointerDown(e, 'start')}
              onKeyDown={makeHandleKeyDown('start')}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={startValue}
              aria-label={handleAriaLabel('start')}
              aria-labelledby={ariaLabelledBy}
              aria-disabled={disabled}
              tabIndex={disabled ? -1 : 0}
            />
          )}

          {/* 结束滑块 */}
          <div
            className={classNames(
              prefixCls('slider-handle'),
              prefixCls('slider-handle-end'),
              dragging === 'end' && prefixCls('slider-handle-active'),
            )}
            style={{ left: `${endPercent}%` }}
            onPointerDown={(e) => handlePointerDown(e, 'end')}
            onKeyDown={makeHandleKeyDown('end')}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={endValue}
            aria-label={handleAriaLabel('end')}
            aria-labelledby={ariaLabelledBy}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          />
        </div>

        {renderMarks()}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
