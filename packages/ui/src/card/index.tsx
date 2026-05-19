import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== CardProps ===== */

export interface CardProps {
  /** 卡片变体
   *  @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  /** 卡片尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否可悬浮上浮 */
  hoverable?: boolean;
  /** 是否显示骨架屏加载状态 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 卡片内容 */
  children?: React.ReactNode;
}

/* ===== Card.Header ===== */

export interface CardHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Header = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('card-header'), className);
    return (
      <div ref={ref} className={cls} style={style}>
        {children}
      </div>
    );
  },
);

Header.displayName = 'Card.Header';

/* ===== Card.Title ===== */

export interface CardTitleProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Title = forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('card-title'), className);
    return (
      <div ref={ref} className={cls} style={style}>
        {children}
      </div>
    );
  },
);

Title.displayName = 'Card.Title';

/* ===== Card.Body ===== */

export interface CardBodyProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Body = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('card-body'), className);
    return (
      <div ref={ref} className={cls} style={style}>
        {children}
      </div>
    );
  },
);

Body.displayName = 'Card.Body';

/* ===== Card.Actions ===== */

export interface CardActionsProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Actions = forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('card-actions'), className);
    return (
      <div ref={ref} className={cls} style={style}>
        {children}
      </div>
    );
  },
);

Actions.displayName = 'Card.Actions';

/* ===== Card.Footer ===== */

export interface CardFooterProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Footer = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('card-footer'), className);
    return (
      <div ref={ref} className={cls} style={style}>
        {children}
      </div>
    );
  },
);

Footer.displayName = 'Card.Footer';

/* ===== Card.Cover ===== */

export interface CardCoverProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Cover = forwardRef<HTMLDivElement, CardCoverProps>(
  ({ className, style, children }, ref) => {
    const cls = classNames(prefixCls('card-cover'), className);
    return (
      <div ref={ref} className={cls} style={style}>
        {children}
      </div>
    );
  },
);

Cover.displayName = 'Card.Cover';

/* ===== Card（主组件） ===== */

const CardBase = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      hoverable = false,
      loading = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const cls = classNames(
      prefixCls('card'),
      variant !== 'default' && prefixCls(`card-${variant}`),
      prefixCls(`card-${size}`),
      hoverable && prefixCls('card-hoverable'),
      className,
    );

    return (
      <div ref={ref} className={cls} style={style}>
        {loading ? (
          <div className={prefixCls('card-skeleton')}>
            <div className={prefixCls('card-skeleton-header')}>
              <div className={prefixCls('card-skeleton-avatar')} />
              <div className={prefixCls('card-skeleton-title')} />
            </div>
            <div className={prefixCls('card-skeleton-row')} />
            <div className={prefixCls('card-skeleton-row')} />
            <div
              className={classNames(
                prefixCls('card-skeleton-row'),
                prefixCls('card-skeleton-row-short'),
              )}
            />
          </div>
        ) : (
          children
        )}
      </div>
    );
  },
);

CardBase.displayName = 'Card';

/* ===== 复合组件导出 ===== */

interface CardComponent
  extends React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  > {
  Header: typeof Header;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  Footer: typeof Footer;
  Cover: typeof Cover;
}

const Card = CardBase as unknown as CardComponent;
Card.Header = Header;
Card.Title = Title;
Card.Body = Body;
Card.Actions = Actions;
Card.Footer = Footer;
Card.Cover = Cover;

export { Card };
