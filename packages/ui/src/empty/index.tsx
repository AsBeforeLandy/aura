import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface EmptyProps {
  /** 描述文字
   *  @default '暂无数据'
   */
  description?: React.ReactNode;
  /** 自定义图片，传 null 则不显示 */
  image?: React.ReactNode;
  /** 图片样式 */
  imageStyle?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 附加内容（如操作按钮） */
  children?: React.ReactNode;
}

/** 默认空状态 SVG 图标 */
const DefaultEmptyImage: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => (
  <svg
    className={prefixCls('empty-image-default')}
    viewBox="0 0 200 160"
    width="200"
    height="160"
    style={style}
  >
    {/* 圆角矩形（文档/盒子） */}
    <rect
      x="30"
      y="40"
      width="140"
      height="100"
      rx="12"
      ry="12"
      fill="var(--aura-bg-tertiary)"
      stroke="var(--aura-border)"
      strokeWidth="1.5"
    />
    {/* 里面三条横线（文字行） */}
    <line x1="56" y1="72" x2="144" y2="72" stroke="var(--aura-border)" strokeWidth="2" strokeLinecap="round" />
    <line x1="56" y1="90" x2="120" y2="90" stroke="var(--aura-border)" strokeWidth="2" strokeLinecap="round" />
    <line x1="56" y1="108" x2="132" y2="108" stroke="var(--aura-border)" strokeWidth="2" strokeLinecap="round" />
    {/* 上方小圆圈（代表空） */}
    <circle cx="100" cy="24" r="12" fill="var(--aura-bg-secondary)" stroke="var(--aura-border)" strokeWidth="1.5" />
    <circle cx="100" cy="24" r="4" fill="var(--aura-border)" />
  </svg>
);

/* ===== 预置空状态 ===== */
export interface EmptyPresetProps {
  /** 预置类型 */
  type: 'noData' | 'noResult' | '404';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 附加内容 */
  children?: React.ReactNode;
}

const presetConfig: Record<
  string,
  { description: string; image: React.ReactNode }
> = {
  noData: {
    description: '暂无数据',
    image: undefined, // 使用默认
  },
  noResult: {
    description: '未找到匹配结果',
    image: undefined,
  },
  404: {
    description: '抱歉，您访问的页面不存在',
    image: (
      <svg viewBox="0 0 200 160" width="200" height="160">
        <text
          x="100"
          y="90"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="60"
          fontWeight="bold"
          fill="var(--aura-text-tertiary)"
        >
          404
        </text>
        <line x1="30" y1="120" x2="170" y2="120" stroke="var(--aura-border)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

/** 预置空状态组件 */
const EmptyPreset: React.FC<EmptyPresetProps> = ({
  type,
  className,
  style,
  children,
}) => {
  const config = presetConfig[type] ?? presetConfig.noData;
  return (
    <EmptyBase
      description={config.description}
      image={config.image}
      className={className}
      style={style}
    >
      {children}
    </EmptyBase>
  );
};

EmptyPreset.displayName = 'EmptyPreset';

/* ===== Empty 主组件 ===== */
const EmptyBase = forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      description = '暂无数据',
      image,
      imageStyle,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const cls = classNames(prefixCls('empty'), className);

    return (
      <div ref={ref} className={cls} style={style}>
        <div className={prefixCls('empty-image')} style={imageStyle}>
          {image !== undefined ? image : <DefaultEmptyImage />}
        </div>
        {description && (
          <div className={prefixCls('empty-description')}>{description}</div>
        )}
        {children && (
          <div className={prefixCls('empty-footer')}>{children}</div>
        )}
      </div>
    );
  },
);

EmptyBase.displayName = 'Empty';

// 子组件挂载
interface EmptyComponent
  extends React.ForwardRefExoticComponent<
    EmptyProps & React.RefAttributes<HTMLDivElement>
  > {
  Preset: typeof EmptyPreset;
}

const Empty = EmptyBase as EmptyComponent;
Empty.Preset = EmptyPreset;

export { Empty };
export default Empty;
