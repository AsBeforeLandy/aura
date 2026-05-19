import React, { forwardRef, HTMLAttributes, createElement } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== Title ===== */

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5;
}

const levelTagMap: Record<number, string> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
};

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  ({ level = 1, className, children, ...rest }, ref) => {
    const cls = classNames(
      prefixCls('typography-title'),
      prefixCls(`typography-title-${level}`),
      className,
    );
    return createElement(
      levelTagMap[level],
      { ref, className: cls, ...rest },
      children,
    );
  },
);

Title.displayName = 'Title';

/* ===== Text ===== */

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  strong?: boolean;
  underline?: boolean;
  delete?: boolean;
  code?: boolean;
  mark?: boolean;
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(
  ({ variant = 'default', strong, underline, delete: del, code, mark, className, children, ...rest }, ref) => {
    const cls = classNames(
      prefixCls('typography-text'),
      variant !== 'default' && prefixCls(`typography-text-${variant}`),
      strong && prefixCls('typography-text-strong'),
      underline && prefixCls('typography-text-underline'),
      code && prefixCls('typography-text-code'),
      mark && prefixCls('typography-text-mark'),
      className,
    );
    const content = del ? <del>{children}</del> : children;
    return (
      <span ref={ref} className={cls} {...rest}>
        {content}
      </span>
    );
  },
);

Text.displayName = 'Text';

/* ===== Paragraph ===== */

export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  ellipsis?: boolean;
}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ ellipsis = false, className, children, ...rest }, ref) => {
    const cls = classNames(
      prefixCls('typography-paragraph'),
      ellipsis && prefixCls('typography-paragraph-ellipsis'),
      className,
    );
    return (
      <p ref={ref} className={cls} {...rest}>
        {children}
      </p>
    );
  },
);

Paragraph.displayName = 'Paragraph';

/* ===== Typography 复合组件 ===== */

export interface TypographyProps extends HTMLAttributes<HTMLSpanElement> {}

const TypographyBase = forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, children, ...rest }, ref) => {
    const cls = classNames(prefixCls('typography'), className);
    return (
      <span ref={ref} className={cls} {...rest}>
        {children}
      </span>
    );
  },
);

TypographyBase.displayName = 'Typography';

interface TypographyComponent
  extends React.ForwardRefExoticComponent<TypographyProps & React.RefAttributes<HTMLSpanElement>> {
  Title: typeof Title;
  Text: typeof Text;
  Paragraph: typeof Paragraph;
}

export const Typography = TypographyBase as unknown as TypographyComponent;
Typography.Title = Title;
Typography.Text = Text;
Typography.Paragraph = Paragraph;
