import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface RateProps {
  /** 星星数量
   *  @default 5
   */
  count?: number;
  /** 当前值（受控） */
  value?: number;
  /** 默认值（非受控）
   *  @default 0
   */
  defaultValue?: number;
  /** 是否允许半星 */
  allowHalf?: boolean;
  /** 是否允许清除（再次点击当前值清零） */
  allowClear?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 星星大小
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 值变化回调 */
  onChange?: (value: number) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 星星 SVG 组件 */
const StarIcon: React.FC<{ filled: boolean; half?: 'left' | 'right' }> = ({
  filled,
  half,
}) => {
  // 完整填充
  if (filled && !half) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // 半星
  if (half) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <defs>
          <clipPath id={`clip-${half}`}>
            <rect
              x={half === 'left' ? '0' : '12'}
              y="0"
              width="12"
              height="24"
            />
          </clipPath>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          opacity={0.25}
        />
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          clipPath={`url(#clip-${half})`}
        />
      </svg>
    );
  }

  // 空星
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="currentColor"
        opacity={0.25}
      />
    </svg>
  );
};

export const Rate = forwardRef<HTMLDivElement, RateProps>(
  (
    {
      count = 5,
      value: controlledValue,
      defaultValue = 0,
      allowHalf = false,
      allowClear = false,
      disabled = false,
      size = 'md',
      onChange,
      className,
      style,
    },
    ref,
  ) => {
    // 内部维护的值（非受控模式）
    const [internalValue, setInternalValue] = useState(defaultValue);
    // hover 预览值
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    // 当前生效的值
    const currentValue = controlledValue ?? internalValue;
    // 显示值（优先 hover）
    const displayValue = hoverValue ?? currentValue;

    // 单个星星容器引用，用于判断半星区域
    const starRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // 根据鼠标位置计算星级值
    const getValueFromEvent = useCallback(
      (e: React.MouseEvent, index: number): number => {
        if (!allowHalf || !starRefs.current[index]) {
          return index + 1;
        }
        const rect = starRefs.current[index]!.getBoundingClientRect();
        const isLeftHalf = e.clientX - rect.left < rect.width / 2;
        return isLeftHalf ? index + 0.5 : index + 1;
      },
      [allowHalf],
    );

    // 鼠标移入
    const handleMouseMove = useCallback(
      (e: React.MouseEvent, index: number) => {
        if (disabled) return;
        setHoverValue(getValueFromEvent(e, index));
      },
      [disabled, getValueFromEvent],
    );

    // 鼠标移出
    const handleMouseLeave = useCallback(() => {
      if (disabled) return;
      setHoverValue(null);
    }, [disabled]);

    // 点击选择
    const handleClick = useCallback(
      (e: React.MouseEvent, index: number) => {
        if (disabled) return;
        const newValue = getValueFromEvent(e, index);

        // allowClear: 再次点击当前值清零
        if (allowClear && newValue === currentValue) {
          if (controlledValue === undefined) {
            setInternalValue(0);
          }
          onChange?.(0);
          return;
        }

        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [disabled, getValueFromEvent, allowClear, currentValue, controlledValue, onChange],
    );

    const cls = classNames(
      prefixCls('rate'),
      prefixCls(`rate-${size}`),
      disabled && prefixCls('rate-disabled'),
      className,
    );

    // 渲染单个星星
    const renderStar = (index: number) => {
      const starValue = index + 1;
      const isFilled = displayValue >= starValue;
      const isHalfLeft =
        allowHalf &&
        !isFilled &&
        displayValue >= starValue - 0.5 &&
        displayValue < starValue;
      // 当使用半星预览时，如果 displayValue 是半星（如 2.5），当前星是第3颗
      // 第2颗星完全填充，第3颗星的左半填充
      const isHalfFilledLeft =
        allowHalf &&
        isFilled === false &&
        Math.ceil(displayValue) === starValue &&
        displayValue % 1 !== 0;

      let filled = isFilled;
      let half: 'left' | 'right' | undefined;

      if (isHalfFilledLeft) {
        filled = true;
        half = 'left';
      } else if (isHalfLeft) {
        filled = false;
        half = 'left';
      }

      const starCls = classNames(
        prefixCls('rate-star'),
        filled && prefixCls('rate-star-filled'),
        half && prefixCls('rate-star-half'),
      );

      return (
        <span
          key={index}
          ref={(el) => { starRefs.current[index] = el; }}
          className={starCls}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onClick={(e) => handleClick(e, index)}
          role="radio"
          aria-checked={filled}
          aria-label={`${starValue} 星`}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as unknown as React.MouseEvent, index);
            }
          }}
        >
          <StarIcon filled={filled} half={half} />
        </span>
      );
    };

    return (
      <div
        ref={ref}
        className={cls}
        style={style}
        role="radiogroup"
        aria-label="评分"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: count }, (_, i) => renderStar(i))}
      </div>
    );
  },
);

Rate.displayName = 'Rate';
