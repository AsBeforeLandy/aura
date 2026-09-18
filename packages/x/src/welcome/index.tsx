import React from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface WelcomeProps {
  /** 顶部图标 / 头像（如 Logo、渐变球） */
  icon?: React.ReactNode;
  /** 欢迎标题（如「早上好，Landy」） */
  title?: React.ReactNode;
  /** 副标题 / 描述 */
  description?: React.ReactNode;
  /** 附加内容插槽（常放 Prompts 提示词集） */
  extra?: React.ReactNode;
  /** board：带边框面板；simple：纯内容 */
  variant?: 'board' | 'simple';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Welcome — 对话开始前的欢迎区。
 *
 * 典型用法：icon + title + description 居中展示，
 * `extra` 里放 [`Prompts`](/x-components/prompts) 引导用户开口。
 */
export const Welcome: React.FC<WelcomeProps> = ({
  icon,
  title,
  description,
  extra,
  variant = 'board',
  className,
  style,
}) => (
  <div
    className={classNames(
      prefixCls('x-welcome'),
      prefixCls(`x-welcome--${variant}`),
      className,
    )}
    style={style}
  >
    {icon ? <div className={prefixCls('x-welcome-icon')}>{icon}</div> : null}
    {title ? <div className={prefixCls('x-welcome-title')}>{title}</div> : null}
    {description ? (
      <div className={prefixCls('x-welcome-description')}>{description}</div>
    ) : null}
    {extra ? <div className={prefixCls('x-welcome-extra')}>{extra}</div> : null}
  </div>
);

Welcome.displayName = 'Welcome';
