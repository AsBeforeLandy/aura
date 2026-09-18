import React from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ActionItem {
  key: React.Key;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  /** 危险操作（红色态） */
  danger?: boolean;
  disabled?: boolean;
  /** 切换态（如点赞 / 收藏） */
  active?: boolean;
  onClick?: () => void;
}

export interface ActionsProps {
  items: ActionItem[];
  direction?: 'horizontal' | 'vertical';
  /** 可访问名称（role=toolbar 时读屏依赖它） */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Actions — 消息操作组。
 *
 * 常放在 [`Bubble`](/x-components/bubble) 的 `footer`：复制、重新生成、点赞、
 * 切换收藏等。语义为工具栏（role=toolbar），按钮从 `label` / `icon`
 * 生成可访问名称。
 */
export const Actions: React.FC<ActionsProps> = ({
  items,
  direction = 'horizontal',
  ariaLabel = '操作',
  className,
  style,
}) => (
  <div
    role="toolbar"
    aria-label={ariaLabel}
    aria-orientation={direction}
    className={classNames(
      prefixCls('x-actions'),
      prefixCls(`x-actions--${direction}`),
      className,
    )}
    style={style}
  >
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        className={classNames(
          prefixCls('x-actions-item'),
          item.danger && prefixCls('x-actions-item--danger'),
          item.active && prefixCls('x-actions-item--active'),
        )}
        disabled={item.disabled}
        aria-label={typeof item.label === 'string' ? item.label : undefined}
        title={typeof item.label === 'string' ? item.label : undefined}
        onClick={item.onClick}
      >
        {item.icon}
        {item.label ? (
          <span className={prefixCls('x-actions-item-label')}>{item.label}</span>
        ) : null}
      </button>
    ))}
  </div>
);

Actions.displayName = 'Actions';
