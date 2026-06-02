import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { ResultSuccess, ResultError, ResultWarning, ResultInfo, NotFound, Forbidden, ServerError } from '@aura/icons';
import './index.less';

/* ===== 类型定义 ===== */

export interface ResultProps {
  /** 结果类型 */
  variant?: 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500';
  /** 标题 */
  title: React.ReactNode;
  /** 副标题 */
  subtitle?: React.ReactNode;
  /** 自定义图标（覆盖默认） */
  icon?: React.ReactNode;
  /** 附加内容（如操作按钮） */
  extra?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/* ===== 默认图标映射 ===== */

const defaultIcons: Record<string, React.ReactNode> = {
  success: <ResultSuccess size={72} />,
  error: <ResultError size={72} />,
  warning: <ResultWarning size={72} />,
  info: <ResultInfo size={72} />,
  '404': <NotFound size={200} />,
  '403': <Forbidden size={200} />,
  '500': <ServerError size={200} />,
};

/* ===== Result 主组件 ===== */

export const Result = forwardRef<HTMLDivElement, ResultProps>(
  (
    {
      variant = 'info',
      title,
      subtitle,
      icon,
      extra,
      className,
      style,
    },
    ref,
  ) => {
    const wrapperCls = classNames(
      prefixCls('result'),
      prefixCls(`result-${variant}`),
      className,
    );

    const displayIcon = icon !== undefined ? icon : defaultIcons[variant] ?? defaultIcons.info;

    return (
      <div ref={ref} className={wrapperCls} style={style} role="status">
        <div className={prefixCls('result-icon')}>
          {displayIcon}
        </div>
        <div className={prefixCls('result-title')}>{title}</div>
        {subtitle && (
          <div className={prefixCls('result-subtitle')}>{subtitle}</div>
        )}
        {extra && (
          <div className={prefixCls('result-extra')}>{extra}</div>
        )}
      </div>
    );
  },
);

Result.displayName = 'Result';

export default Result;
