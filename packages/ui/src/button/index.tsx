import React, { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
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
  /** 按钮图标，置于内容左侧；loading 时自动替换为旋转图标 */
  icon?: React.ReactNode;
  /** 是否撑满容器宽度
   *  @default false
   */
  block?: boolean;
  /** 传入后渲染为 `<a>` 链接按钮（配合 target 使用） */
  href?: string;
  /** 链接按钮的打开方式，仅在设置 href 时生效 */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
}

type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

export const Button = forwardRef<ButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      block = false,
      href,
      target,
      className,
      children,
      onClick,
      type,
      ...rest
    },
    ref,
  ) => {
    const blocked = disabled || loading;

    const cls = classNames(
      prefixCls('btn'),
      variant !== 'default' && prefixCls(`btn-${variant}`),
      prefixCls(`btn-${size}`),
      loading && prefixCls('btn-loading'),
      blocked && href !== undefined && prefixCls('btn-disabled'),
      block && prefixCls('btn-block'),
      className,
    );

    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    ) => {
      if (blocked) {
        e.preventDefault();
        return;
      }
      onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    };

    // 图标区：loading 时旋转图标替换自定义图标（同 antd 行为）
    const iconNode = loading ? (
      <span className={prefixCls('btn-loading-icon')} />
    ) : (
      icon
    );

    // 链接按钮：渲染 <a>，禁用时不输出 href 且阻止点击
    if (href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cls}
          href={blocked ? undefined : href}
          target={target}
          onClick={handleClick}
          aria-disabled={blocked || undefined}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {iconNode}
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        type={type ?? 'button'}
        disabled={blocked}
        onClick={handleClick}
        {...rest}
      >
        {iconNode}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
