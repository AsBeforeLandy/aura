import React from 'react';
import type { TwoToneIconProps } from '../types';

/** 双色图标通用骨架：底色层 + 前景层 */
function renderTwoTone(
  size: number,
  color: string,
  twoToneColor: string,
  renderBg: (bgColor: string) => React.ReactNode,
  renderFg: (fgColor: string) => React.ReactNode,
  className?: string,
  style?: React.CSSProperties,
) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} aria-hidden="true" role="img">
      <svg viewBox="0 0 24 24" width={size} height={size}>
        {renderBg(twoToneColor)}
        {renderFg(color)}
      </svg>
    </span>
  );
}

/** 双色-成功勾选 */
export const CheckCircleTwoTone: React.FC<TwoToneIconProps> = ({
  size = 24,
  color = '#1677ff',
  twoToneColor = '#e6f4ff',
  className,
  style,
}) =>
  renderTwoTone(
    size,
    color,
    twoToneColor,
    (bg) => <circle cx="12" cy="12" r="10" fill={bg} />,
    (fg) => (
      <path
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
        fill={fg}
      />
    ),
    className,
    style,
  );

/** 双色-错误叉号 */
export const CloseCircleTwoTone: React.FC<TwoToneIconProps> = ({
  size = 24,
  color = '#ff4d4f',
  twoToneColor = '#fff1f0',
  className,
  style,
}) =>
  renderTwoTone(
    size,
    color,
    twoToneColor,
    (bg) => <circle cx="12" cy="12" r="10" fill={bg} />,
    (fg) => (
      <path
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
        fill={fg}
      />
    ),
    className,
    style,
  );

/** 双色-警告三角 */
export const WarningTriangleTwoTone: React.FC<TwoToneIconProps> = ({
  size = 24,
  color = '#faad14',
  twoToneColor = '#fffbe6',
  className,
  style,
}) =>
  renderTwoTone(
    size,
    color,
    twoToneColor,
    (bg) => <path d="M1 21h22L12 2 1 21z" fill={bg} />,
    (fg) => (
      <path d="M11 15h2v2h-2zm0-4h2v4h-2z" fill={fg} />
    ),
    className,
    style,
  );

/** 双色-信息圆圈 */
export const InfoCircleTwoTone: React.FC<TwoToneIconProps> = ({
  size = 24,
  color = '#1677ff',
  twoToneColor = '#e6f4ff',
  className,
  style,
}) =>
  renderTwoTone(
    size,
    color,
    twoToneColor,
    (bg) => <circle cx="12" cy="12" r="10" fill={bg} />,
    (fg) => (
      <>
        <rect x="11" y="7" width="2" height="2" rx="1" fill={fg} />
        <rect x="11" y="11" width="2" height="6" rx="1" fill={fg} />
      </>
    ),
    className,
    style,
  );

/** 双色-问号圆圈 */
export const QuestionCircleTwoTone: React.FC<TwoToneIconProps> = ({
  size = 24,
  color = '#1677ff',
  twoToneColor = '#e6f4ff',
  className,
  style,
}) =>
  renderTwoTone(
    size,
    color,
    twoToneColor,
    (bg) => <circle cx="12" cy="12" r="10" fill={bg} />,
    (fg) => (
      <>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill={fg} />
      </>
    ),
    className,
    style,
  );
