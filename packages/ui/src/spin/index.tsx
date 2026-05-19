import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SpinProps {
  /** 加载指示器尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否加载中
   *  @default true
   */
  spinning?: boolean;
  /** 加载提示文字 */
  tip?: React.ReactNode;
  /** 自定义加载图标 */
  indicator?: React.ReactNode;
  /** 包裹的内容（加载时半透明） */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 默认旋转圆环 */
const DefaultIndicator: React.FC<{ size: string }> = ({ size }) => {
  const sizeMap: Record<string, number> = { sm: 16, md: 24, lg: 36 };
  const s = sizeMap[size] ?? 24;
  return (
    <svg
      className={prefixCls('spin-svg')}
      width={s}
      height={s}
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Spin = forwardRef<HTMLDivElement, SpinProps>(
  (
    {
      size = 'md',
      spinning = true,
      tip,
      indicator,
      children,
      className,
      style,
    },
    ref,
  ) => {
    const spinElement = (
      <div className={prefixCls('spin-indicator')}>
        {indicator ?? <DefaultIndicator size={size} />}
        {tip && <span className={prefixCls('spin-tip')}>{tip}</span>}
      </div>
    );

    // 没有 children 时，直接显示 spin
    if (!children) {
      const cls = classNames(
        prefixCls('spin'),
        prefixCls(`spin-${size}`),
        className,
      );
      return (
        <div ref={ref} className={cls} style={style}>
          {spinElement}
        </div>
      );
    }

    // 有 children 时：spinning 控制覆盖层
    const containerCls = classNames(
      prefixCls('spin-container'),
      spinning && prefixCls('spin-spinning'),
      className,
    );

    return (
      <div ref={ref} className={containerCls} style={style}>
        {spinning && (
          <div className={prefixCls('spin-overlay')}>
            {spinElement}
          </div>
        )}
        <div
          className={classNames(
            prefixCls('spin-content'),
            spinning && prefixCls('spin-content-blur'),
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);

Spin.displayName = 'Spin';
