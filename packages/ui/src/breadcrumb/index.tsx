import React, {
  forwardRef,
  createContext,
  useContext,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== Context ===== */
interface BreadcrumbContextValue {
  /** 是否为最后一个项 */
  isLast: (index: number) => boolean;
  /** 总子项数量 */
  total: number;
  separator: React.ReactNode;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

/* ===== Breadcrumb.Item ===== */
export interface BreadcrumbItemProps {
  /** 链接地址 */
  href?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const BreadcrumbItem = forwardRef<HTMLSpanElement, BreadcrumbItemProps>(
  ({ href, onClick, className, style, children }, ref) => {
    const ctx = useContext(BreadcrumbContext);
    const itemCls = classNames(prefixCls('breadcrumb-item'), className);

    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        className={prefixCls('breadcrumb-item-wrapper')}
      >
        {href ? (
          <a
            href={href}
            className={itemCls}
            style={style}
            onClick={onClick}
            role="link"
          >
            {children}
          </a>
        ) : (
          <span
            className={itemCls}
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
          >
            {children}
          </span>
        )}
      </li>
    );
  },
);

BreadcrumbItem.displayName = 'Breadcrumb.Item';

/* ===== Breadcrumb（主组件） ===== */
export interface BreadcrumbProps {
  /** 分隔符
   *  @default '/'
   */
  separator?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const BreadcrumbBase = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator = '/', className, style, children }, ref) => {
    const childArray = React.Children.toArray(children);
    const total = childArray.length;

    const ctxValue: BreadcrumbContextValue = {
      isLast: (index: number) => index === total - 1,
      total,
      separator,
    };

    const wrapperCls = classNames(prefixCls('breadcrumb'), className);

    return (
      <BreadcrumbContext.Provider value={ctxValue}>
        <nav
          ref={ref}
          className={wrapperCls}
          style={style}
          aria-label="面包屑导航"
          role="navigation"
        >
          <ol className={prefixCls('breadcrumb-list')}>
            {childArray.map((child, index) => {
              const isLast = index === total - 1;
              return (
                <React.Fragment key={index}>
                  {React.isValidElement<BreadcrumbItemProps>(child)
                    ? React.cloneElement(child, {
                        ...child.props,
                        className: classNames(
                          child.props.className,
                          isLast && prefixCls('breadcrumb-item-last'),
                        ),
                      })
                    : child}
                  {!isLast && (
                    <li
                      className={prefixCls('breadcrumb-separator')}
                      aria-hidden="true"
                    >
                      {separator}
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </BreadcrumbContext.Provider>
    );
  },
);

BreadcrumbBase.displayName = 'Breadcrumb';

/* ===== 复合组件导出 ===== */
interface BreadcrumbComponent
  extends React.ForwardRefExoticComponent<
    BreadcrumbProps & React.RefAttributes<HTMLElement>
  > {
  Item: typeof BreadcrumbItem;
}

const Breadcrumb = BreadcrumbBase as unknown as BreadcrumbComponent;
Breadcrumb.Item = BreadcrumbItem;

export { Breadcrumb };
