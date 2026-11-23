import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import './index.less';

export interface BadgeProps {
  /** 状态点模式（不计数）：success / processing（带光环）/ error / warning / default，
   *  配合 `text` 展示状态说明；设置后 count / dot 等属性不生效 */
  status?: 'success' | 'processing' | 'error' | 'warning' | 'default';
  /** 状态点模式的说明文本 */
  text?: React.ReactNode;
  /** 徽标数字，0 时默认隐藏 */
  count?: number;
  /** 是否只显示小圆点 */
  dot?: boolean;
  /** 徽标变体颜色
   *  @default 'error'
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** 溢出计数阈值
   *  @default 99
   */
  overflowCount?: number;
  /** 是否在 count 为 0 时显示 */
  showZero?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 包裹的子元素，有则徽标定位在右上角 */
  children?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      status,
      text,
      count = 0,
      dot = false,
      variant = 'error',
      overflowCount = 99,
      showZero = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    // 数字翻滚动画：count 变化时记录旧值与方向（增大 up / 减小 down），
    // 徽标容器与背景保持不动，只有内部数字层做垂直翻滚
    const [roll, setRoll] = useState<{
      from: number;
      dir: 'up' | 'down';
    } | null>(null);
    const prevCountRef = useRef(count);

    useEffect(() => {
      if (prevCountRef.current !== count) {
        const dir = count > prevCountRef.current ? 'up' : 'down';
        setRoll({ from: prevCountRef.current, dir });
        prevCountRef.current = count;
        const timer = setTimeout(() => setRoll(null), 400);
        return () => clearTimeout(timer);
      }
    }, [count]);

    // 状态点模式：不计数，仅状态圆点 + 文本
    if (status) {
      return (
        <span
          ref={ref}
          className={classNames(prefixCls('badge-status'), className)}
          style={style}
        >
          <span
            className={classNames(
              prefixCls('badge-status-dot'),
              prefixCls(`badge-status-${status}`),
            )}
          />
          {text != null && (
            <span className={prefixCls('badge-status-text')}>{text}</span>
          )}
        </span>
      );
    }

    const displayCount =
      count > overflowCount ? `${overflowCount}+` : String(count);
    const showBadge = count !== 0 || showZero;

    // 翻滚层的旧值展示（沿用同一溢出规则）
    const displayFrom =
      roll && roll.from > overflowCount
        ? `${overflowCount}+`
        : roll
          ? String(roll.from)
          : '';

    const badgeCls = classNames(
      prefixCls('badge-dot'),
      variant !== 'default' && prefixCls(`badge-dot-${variant}`),
      dot && prefixCls('badge-dot-small'),
    );

    /** 数字层：翻滚动画进行中输出双层滚动结构，否则静态数字 */
    const renderCount = () => {
      if (roll) {
        return (
          <span
            key={count}
            className={classNames(
              prefixCls('badge-roll'),
              prefixCls(`badge-roll-${roll.dir}`),
            )}
          >
            <span className={prefixCls('badge-roll-item')}>{displayFrom}</span>
            <span className={prefixCls('badge-roll-item')}>{displayCount}</span>
          </span>
        );
      }
      return <span className={prefixCls('badge-text')}>{displayCount}</span>;
    };

    // 无子元素：独立显示
    if (children === undefined) {
      const wrapperCls = classNames(prefixCls('badge-standalone'), className);
      return (
        <span ref={ref} className={wrapperCls} style={style}>
          {dot && showBadge && <span className={badgeCls} />}
          {!dot && showBadge && (
            <span className={badgeCls}>{renderCount()}</span>
          )}
        </span>
      );
    }

    // 有子元素：徽标定位在右上角
    const wrapperCls = classNames(prefixCls('badge'), className);

    return (
      <span ref={ref} className={wrapperCls} style={style}>
        {children}
        {dot && showBadge && <sup className={badgeCls} />}
        {!dot && showBadge && <sup className={badgeCls}>{renderCount()}</sup>}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
