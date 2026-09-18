import React from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface PromptItem {
  key: React.Key;
  /** 提示词主文案 */
  label: React.ReactNode;
  /** 补充说明 */
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface PromptsProps {
  items: PromptItem[];
  /** 点击某条提示词 */
  onItemClick?: (item: PromptItem) => void;
  /** 排列方向：vertical 纵向卡片，horizontal 横向卡片流 */
  direction?: 'vertical' | 'horizontal';
  /** 分组标题（如「试试这样问」） */
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Prompts — 提示词集。
 *
 * 常与 [`Welcome`](/x-components/welcome) 的 `extra` 或 `Sender` 上方组合，
 * 引导用户快速开口。语义为按钮列表：键盘可达，Enter / 空格触发。
 */
export const Prompts: React.FC<PromptsProps> = ({
  items,
  onItemClick,
  direction = 'vertical',
  title,
  className,
  style,
}) => (
  <div
    className={classNames(
      prefixCls('x-prompts'),
      prefixCls(`x-prompts--${direction}`),
      className,
    )}
    style={style}
  >
    {title ? <div className={prefixCls('x-prompts-title')}>{title}</div> : null}
    <ul className={prefixCls('x-prompts-list')} role="list">
      {items.map((item) => (
        <li key={item.key} role="listitem">
          <button
            type="button"
            className={prefixCls('x-prompts-item')}
            onClick={() => onItemClick?.(item)}
          >
            {item.icon ? (
              <span className={prefixCls('x-prompts-item-icon')}>{item.icon}</span>
            ) : null}
            <span className={prefixCls('x-prompts-item-body')}>
              <span className={prefixCls('x-prompts-item-label')}>{item.label}</span>
              {item.description ? (
                <span className={prefixCls('x-prompts-item-description')}>
                  {item.description}
                </span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

Prompts.displayName = 'Prompts';
