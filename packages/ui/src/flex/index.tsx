import React, { forwardRef, CSSProperties } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface FlexProps {
  /** 主轴方向
   *  @default 'row'
   */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** 主轴对齐方式 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** 交叉轴对齐方式 */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** 是否换行，传 true 等价于 'wrap'
   *  @default 'nowrap'
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | true;
  /** 间距：预设值或具体像素值 */
  gap?: 'sm' | 'md' | 'lg' | number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

/** justify 映射 */
const justifyMap: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/** align 映射 */
const alignMap: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

/** gap 预设映射 */
const gapMap: Record<string, number> = {
  sm: 8,
  md: 16,
  lg: 24,
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      justify,
      align,
      wrap = 'nowrap',
      gap,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const cls = classNames(prefixCls('flex'), className);

    // 构建 inline style 用于动态 flex 属性
    const flexStyle: CSSProperties = {
      ...style,
      flexDirection: direction,
      flexWrap: wrap === true ? 'wrap' : wrap,
      ...(justify ? { justifyContent: justifyMap[justify] } : {}),
      ...(align ? { alignItems: alignMap[align] } : {}),
      ...(gap !== undefined
        ? { gap: typeof gap === 'number' ? `${gap}px` : `${gapMap[gap]}px` }
        : {}),
    };

    return (
      <div ref={ref} className={cls} style={flexStyle}>
        {children}
      </div>
    );
  },
);

Flex.displayName = 'Flex';
