import React, { forwardRef, useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { CheckCircleFilled, WarningTriangleFilled, CloseCircleFilled, InfoCircleFilled, Close } from '@aura/icons';
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

/** 不同 variant 对应的图标 */
const variantIcons: Record<string, React.ReactNode> = {
  success: <CheckCircleFilled size={16} />,
  warning: <WarningTriangleFilled size={16} />,
  error: <CloseCircleFilled size={16} />,
  info: <InfoCircleFilled size={16} />,
  default: <InfoCircleFilled size={16} />,
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
            <Close size={14} />
          </button>
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';
