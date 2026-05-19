import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
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
  success: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9,12 11,14 15,10" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  '404': (
    <svg viewBox="0 0 200 120" width="200" height="120">
      <text
        x="100"
        y="60"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="64"
        fontWeight="bold"
        fill="var(--aura-text-tertiary)"
        fontFamily="inherit"
      >
        404
      </text>
      <line x1="20" y1="90" x2="180" y2="90" stroke="var(--aura-border)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="30" r="6" fill="var(--aura-bg-tertiary)" stroke="var(--aura-border)" strokeWidth="1" />
      <circle cx="160" cy="40" r="4" fill="var(--aura-bg-tertiary)" stroke="var(--aura-border)" strokeWidth="1" />
    </svg>
  ),
  '403': (
    <svg viewBox="0 0 200 120" width="200" height="120">
      <rect x="70" y="20" width="60" height="50" rx="4" fill="var(--aura-bg-tertiary)" stroke="var(--aura-border)" strokeWidth="1.5" />
      <rect x="90" y="30" width="20" height="8" rx="4" fill="var(--aura-text-tertiary)" />
      <circle cx="100" cy="50" r="6" fill="var(--aura-text-tertiary)" />
      <rect x="97" y="54" width="6" height="10" rx="2" fill="var(--aura-text-tertiary)" />
      <text
        x="100"
        y="95"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="var(--aura-text-tertiary)"
        fontFamily="inherit"
      >
        403
      </text>
    </svg>
  ),
  '500': (
    <svg viewBox="0 0 200 120" width="200" height="120">
      <rect x="60" y="25" width="80" height="50" rx="4" fill="var(--aura-bg-tertiary)" stroke="var(--aura-border)" strokeWidth="1.5" />
      <line x1="70" y1="40" x2="130" y2="40" stroke="var(--aura-border)" strokeWidth="1" strokeLinecap="round" />
      <line x1="70" y1="50" x2="120" y2="50" stroke="var(--aura-border)" strokeWidth="1" strokeLinecap="round" />
      <line x1="70" y1="60" x2="110" y2="60" stroke="var(--aura-border)" strokeWidth="1" strokeLinecap="round" />
      <text
        x="100"
        y="100"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="var(--aura-text-tertiary)"
        fontFamily="inherit"
      >
        500
      </text>
    </svg>
  ),
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
