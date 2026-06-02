import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { EmptyDefault, Empty404 } from '@aura/icons';
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

/** 默认空状态图标 */
const DefaultEmptyImage: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => (
  <EmptyDefault size={200} className={prefixCls('empty-image-default')} style={style} />
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
    image: <Empty404 size={200} />,
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
