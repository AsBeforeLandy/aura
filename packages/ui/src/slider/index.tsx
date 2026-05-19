import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SliderProps {
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
  /** 值变化回调 */
  onChange?: (value: number | [number, number]) => void;
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
      className,
      style,
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

    // 处理鼠标按下
    const handleMouseDown = useCallback(
      (e: React.MouseEvent, handle: 'start' | 'end') => {
        if (disabled) return;
        e.preventDefault();
        setDragging(handle);
      },
      [disabled],
    );

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
      },
      [disabled, dragging, getValueFromPosition, currentValue, range, updateValue],
    );

    // 拖拽移动和松开事件
    useEffect(() => {
      if (!dragging) return;

      const handleMouseMove = (e: MouseEvent) => {
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

      const handleMouseUp = () => {
        setDragging(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [dragging, getValueFromPosition, currentValue, range, updateValue]);

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

    return (
      <div
        ref={ref}
        className={cls}
        style={style}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={range ? undefined : (currentValue as number)}
        aria-disabled={disabled}
      >
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
              onMouseDown={(e) => handleMouseDown(e, 'start')}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={startValue}
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
            onMouseDown={(e) => handleMouseDown(e, range ? 'end' : 'end')}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={endValue}
            tabIndex={disabled ? -1 : 0}
          />
        </div>

        {renderMarks()}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
