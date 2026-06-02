import React, {
  forwardRef,
  useState,
  useCallback,
  HTMLAttributes,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { ChevronLeft } from '@aura/icons';
import './index.less';

/* ===== LayoutHeader ===== */

export interface LayoutHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const LayoutHeader = forwardRef<HTMLElement, LayoutHeaderProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('layout-header'), className);
    return (
      <header ref={ref} className={cls} style={style} role="banner">
        {children}
      </header>
    );
  },
);

LayoutHeader.displayName = 'Layout.Header';

/* ===== LayoutBody ===== */

export interface LayoutBodyProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const LayoutBody = forwardRef<HTMLElement, LayoutBodyProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('layout-body'), className);
    return (
      <main ref={ref} className={cls} style={style} role="main">
        {children}
      </main>
    );
  },
);

LayoutBody.displayName = 'Layout.Body';

/* ===== LayoutSider ===== */

export interface LayoutSiderProps {
  /** 侧边栏宽度
   *  @default 200
   */
  width?: number;
  /** 是否可折叠 */
  collapsible?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const LayoutSider = forwardRef<HTMLElement, LayoutSiderProps>(
  ({ width = 200, collapsible = false, className, style, children }, ref) => {
    const [collapsed, setCollapsed] = useState(false);
    const siderWidth = collapsed ? 64 : width;

    const handleToggle = useCallback(() => {
      setCollapsed((prev) => !prev);
    }, []);

    const cls = classNames(
      prefixCls('layout-sider'),
      collapsed && prefixCls('layout-sider-collapsed'),
      className,
    );

    return (
      <aside
        ref={ref}
        className={cls}
        style={{ ...style, width: siderWidth, flexShrink: 0 }}
        role="complementary"
        aria-label="侧边栏"
      >
        <div className={prefixCls('layout-sider-content')}>{children}</div>
        {collapsible && (
          <button
            className={prefixCls('layout-sider-trigger')}
            onClick={handleToggle}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
            aria-expanded={!collapsed}
          >
            <span
              style={{
                display: 'inline-flex',
                transition: 'transform var(--aura-duration-normal) var(--aura-easing)',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ChevronLeft size={16} />
            </span>
          </button>
        )}
      </aside>
    );
  },
);

LayoutSider.displayName = 'Layout.Sider';

/* ===== LayoutFooter ===== */

export interface LayoutFooterProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const LayoutFooter = forwardRef<HTMLElement, LayoutFooterProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('layout-footer'), className);
    return (
      <footer ref={ref} className={cls} style={style} role="contentinfo">
        {children}
      </footer>
    );
  },
);

LayoutFooter.displayName = 'Layout.Footer';

/* ===== Layout 主组件 ===== */

export interface LayoutProps {
  /** 是否包含侧边栏（影响布局方向） */
  hasSider?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const LayoutBase = forwardRef<HTMLDivElement, LayoutProps>(
  ({ hasSider = false, className, style, children }, ref) => {
    const cls = classNames(
      prefixCls('layout'),
      hasSider && prefixCls('layout-has-sider'),
      className,
    );

    return (
      <section ref={ref} className={cls} style={style} role="region">
        {children}
      </section>
    );
  },
);

LayoutBase.displayName = 'Layout';

/* ===== 复合组件导出 ===== */

interface LayoutComponent
  extends React.ForwardRefExoticComponent<LayoutProps & React.RefAttributes<HTMLDivElement>> {
  Header: typeof LayoutHeader;
  Body: typeof LayoutBody;
  Sider: typeof LayoutSider;
  Footer: typeof LayoutFooter;
}

const Layout = LayoutBase as unknown as LayoutComponent;
Layout.Header = LayoutHeader;
Layout.Body = LayoutBody;
Layout.Sider = LayoutSider;
Layout.Footer = LayoutFooter;

export { Layout };
