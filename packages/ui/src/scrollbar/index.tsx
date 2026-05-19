import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ScrollbarProps {
  /** 最大高度 */
  maxHeight?: number | string;
  /** 最大宽度 */
  maxWidth?: number | string;
  /** 是否始终显示滚动条
   *  @default false
   */
  alwaysShow?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 内容 */
  children?: React.ReactNode;
}

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
  (
    {
      maxHeight,
      maxWidth,
      alwaysShow = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const cls = classNames(
      prefixCls('scrollbar'),
      alwaysShow && prefixCls('scrollbar-always'),
      className,
    );

    // 处理尺寸值
    const normalizeSize = (value: number | string | undefined): string | undefined => {
      if (value === undefined) return undefined;
      return typeof value === 'number' ? `${value}px` : value;
    };

    const scrollbarStyle: React.CSSProperties = {
      ...style,
      maxHeight: normalizeSize(maxHeight),
      maxWidth: normalizeSize(maxWidth),
    };

    return (
      <div
        ref={ref}
        className={cls}
        style={scrollbarStyle}
        role="region"
        aria-label="可滚动区域"
        tabIndex={0}
      >
        {children}
      </div>
    );
  },
);

Scrollbar.displayName = 'Scrollbar';
