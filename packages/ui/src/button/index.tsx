import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './index.less';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  /** 按钮大小 */
  size?: 'small' | 'middle' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 点击回调 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'middle',
  disabled = false,
  loading = false,
  className = '',
  ...rest
}) => {
  const classes = [
    'aura-btn',
    `aura-btn-${type}`,
    `aura-btn-${size}`,
    disabled ? 'aura-btn-disabled' : '',
    loading ? 'aura-btn-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="aura-btn-loading-icon" />}
      <span>{children}</span>
    </button>
  );
};

export { Button };
export default Button;
