import React, { forwardRef, HTMLAttributes, CSSProperties } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** 分割线方向
   *  @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';
  /** 样式变体
   *  @default 'default'
   */
  variant?: 'default' | 'dashed';
  /** 文字位置（仅水平方向且有 children 时生效）
   *  @default 'center'
   */
  orientation?: 'left' | 'center' | 'right';
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      direction = 'horizontal',
      variant = 'default',
      orientation = 'center',
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const hasText = direction === 'horizontal' && children !== undefined && children !== null;

    const cls = classNames(
      prefixCls('divider'),
      prefixCls(`divider-${direction}`),
      variant === 'dashed' && prefixCls('divider-dashed'),
      hasText && prefixCls('divider-with-text'),
      hasText && prefixCls(`divider-with-text-${orientation}`),
      className,
    );

    if (hasText) {
      return (
        <div ref={ref} className={cls} style={style} role="separator" {...rest}>
          <span className={prefixCls('divider-inner-text')}>{children}</span>
        </div>
      );
    }

    return <div ref={ref} className={cls} style={style} role="separator" {...rest} />;
  },
);

Divider.displayName = 'Divider';
