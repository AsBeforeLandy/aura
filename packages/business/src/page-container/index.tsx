import React, { forwardRef } from 'react';
import { Breadcrumb, Skeleton } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface PageContainerBreadcrumbItem {
  /** 面包屑文案 */
  title: React.ReactNode;
  /** 跳转链接 */
  href?: string;
}

export interface PageContainerProps {
  /** 页面标题 */
  title?: React.ReactNode;
  /** 标题下的描述文字 */
  description?: React.ReactNode;
  /** 面包屑导航 */
  breadcrumb?: PageContainerBreadcrumbItem[];
  /** 头部右侧操作区 */
  extra?: React.ReactNode;
  /**
   * 内容区是否加内边距
   * @default true
   */
  contentPadding?: boolean;
  /**
   * 加载状态，为 true 时以骨架屏占位
   * @default false
   */
  loading?: boolean;
  /** 底部固定工具栏 */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * PageContainer — 页面容器
 *
 * 统一中后台页面的骨架结构：面包屑 + 标题区 + 操作区 + 内容区 + 底部工具栏。
 * 有标题时才渲染头部，避免空状态下出现多余留白。
 */
export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      title,
      description,
      breadcrumb,
      extra,
      contentPadding = true,
      loading = false,
      footer,
      children,
      className,
      style,
    },
    ref,
  ) => {
    const prefix = prefixCls('page-container');
    const hasHeader = Boolean(
      title || description || extra || (breadcrumb && breadcrumb.length > 0),
    );

    return (
      <div ref={ref} className={classNames(prefix, className)} style={style}>
        {hasHeader && (
          <div className={`${prefix}-header`}>
            {breadcrumb && breadcrumb.length > 0 && (
              <Breadcrumb
                className={`${prefix}-breadcrumb`}
                items={breadcrumb.map((item) => ({
                  title: item.href ? (
                    <a href={item.href}>{item.title}</a>
                  ) : (
                    item.title
                  ),
                }))}
              />
            )}
            <div className={`${prefix}-header-main`}>
              <div className={`${prefix}-header-text`}>
                {title && <div className={`${prefix}-title`}>{title}</div>}
                {description && (
                  <div className={`${prefix}-description`}>{description}</div>
                )}
              </div>
              {extra && <div className={`${prefix}-extra`}>{extra}</div>}
            </div>
          </div>
        )}

        <div
          className={classNames(
            `${prefix}-content`,
            contentPadding && `${prefix}-content-padded`,
          )}
        >
          <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
            {children}
          </Skeleton>
        </div>

        {footer && <div className={`${prefix}-footer`}>{footer}</div>}
      </div>
    );
  },
);

PageContainer.displayName = 'PageContainer';
