import React from 'react';

export interface IconProps {
  /** 图标大小，默认 24 */
  size?: number;
  /** 图标颜色，默认 currentColor 继承父级 */
  color?: string;
  /** 附加 CSS 类名 */
  className?: string;
  /** 行内样式 */
  style?: React.CSSProperties;
}

/** 双色图标额外 Props */
export interface TwoToneIconProps extends IconProps {
  /** 辅助颜色（背景/底色），默认取 color 并降低透明度 */
  twoToneColor?: string;
}

/** 通用图标包装组件 */
export const IconWrapper: React.FC<IconProps & { children: React.ReactNode }> = ({
  size,
  color,
  className,
  style,
  children,
}) => (
  <span
    className={className}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    aria-hidden="true"
    role="img"
  >
    {children}
  </span>
);
