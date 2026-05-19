import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  /** 按钮尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中，显示旋转图标 */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      disabled = false,
      loading = false,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const cls = classNames(
      prefixCls('btn'),
      variant !== 'default' && prefixCls(`btn-${variant}`),
      prefixCls(`btn-${size}`),
      loading && prefixCls('btn-loading'),
      className,
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        onClick={handleClick}
        {...rest}
      >
        {loading && <span className={prefixCls('btn-loading-icon')} />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
