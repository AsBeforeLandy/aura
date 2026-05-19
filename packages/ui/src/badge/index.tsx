import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface BadgeProps {
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
    // 用于数字变化时的缩放动画
    const [animating, setAnimating] = useState(false);
    const prevCountRef = useRef(count);

    useEffect(() => {
      if (prevCountRef.current !== count) {
        setAnimating(true);
        prevCountRef.current = count;
        const timer = setTimeout(() => setAnimating(false), 400);
        return () => clearTimeout(timer);
      }
    }, [count]);

    const displayCount =
      count > overflowCount ? `${overflowCount}+` : String(count);
    const showBadge = count !== 0 || showZero;

    const badgeCls = classNames(
      prefixCls('badge-dot'),
      variant !== 'default' && prefixCls(`badge-dot-${variant}`),
      dot && prefixCls('badge-dot-small'),
      animating && prefixCls('badge-dot-animate'),
    );

    // 无子元素：独立显示
    if (children === undefined) {
      const wrapperCls = classNames(prefixCls('badge-standalone'), className);
      return (
        <span ref={ref} className={wrapperCls} style={style}>
          {dot && showBadge && <span className={badgeCls} />}
          {!dot && showBadge && (
            <span className={badgeCls}>
              <span className={prefixCls('badge-text')}>{displayCount}</span>
            </span>
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
        {!dot && showBadge && (
          <sup className={badgeCls}>
            <span className={prefixCls('badge-text')}>{displayCount}</span>
          </sup>
        )}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
