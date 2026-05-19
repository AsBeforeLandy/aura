import React, { forwardRef, HTMLAttributes, CSSProperties } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  /** 排列方向
   *  @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';
  /** 间距大小，支持预设尺寸或自定义像素值
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | number;
  /** 是否自动换行（仅水平方向有效） */
  wrap?: boolean;
  /** 对齐方式 */
  align?: 'start' | 'center' | 'end' | 'baseline';
}

const sizeMap: Record<string, number> = {
  sm: 8,
  md: 16,
  lg: 24,
};

export const Space = forwardRef<HTMLDivElement, SpaceProps>(
  (
    {
      direction = 'horizontal',
      size = 'md',
      wrap = false,
      align,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const gap = typeof size === 'number' ? size : sizeMap[size];

    const cls = classNames(
      prefixCls('space'),
      direction === 'vertical' && prefixCls('space-vertical'),
      wrap && prefixCls('space-wrap'),
      align && prefixCls(`space-align-${align}`),
      className,
    );

    const mergedStyle: CSSProperties = {
      ...style,
      gap: `${gap}px`,
    };

    return (
      <div ref={ref} className={cls} style={mergedStyle} {...rest}>
        {children}
      </div>
    );
  },
);

Space.displayName = 'Space';
