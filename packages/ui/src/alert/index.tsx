import React, { forwardRef, useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface AlertProps {
  /** 提示类型
   *  @default 'default'
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** 标题 */
  title?: React.ReactNode;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 描述内容 */
  children?: React.ReactNode;
}

/** 不同 variant 对应的图标 SVG */
const variantIcons: Record<string, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'default',
      title,
      closable = false,
      showIcon = false,
      onClose,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const handleClose = () => {
      setVisible(false);
      onClose?.();
    };

    const cls = classNames(
      prefixCls('alert'),
      variant !== 'default' && prefixCls(`alert-${variant}`),
      showIcon && prefixCls('alert-with-icon'),
      className,
    );

    return (
      <div ref={ref} className={cls} style={style} role="alert">
        {showIcon && (
          <span className={prefixCls('alert-icon')}>
            {variantIcons[variant]}
          </span>
        )}
        <span className={prefixCls('alert-content')}>
          {title && <span className={prefixCls('alert-title')}>{title}</span>}
          {children && <span className={prefixCls('alert-description')}>{children}</span>}
        </span>
        {closable && (
          <button
            type="button"
            className={prefixCls('alert-close')}
            onClick={handleClose}
            aria-label="关闭"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';
