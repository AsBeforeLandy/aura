import React from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SuggestionItem {
  key: React.Key;
  label: React.ReactNode;
}

export interface SuggestionProps {
  items: SuggestionItem[];
  /** 选中某条建议（点击或键盘 Enter） */
  onSelect?: (item: SuggestionItem) => void;
  /** 是否展示；false 时渲染 null（用于受控开合） */
  open?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Suggestion — 快捷建议。
 *
 * 常放在 `Sender` 上方，跟随输入内容给出续写建议；
 * 语义为按钮列表：键盘可达，Enter / 空格触发。
 */
export const Suggestion: React.FC<SuggestionProps> = ({
  items,
  onSelect,
  open = true,
  className,
  style,
}) => {
  if (!open || items.length === 0) return null;

  return (
    <div
      className={classNames(prefixCls('x-suggestion'), className)}
      style={style}
    >
      <ul className={prefixCls('x-suggestion-list')} role="list">
        {items.map((item) => (
          <li key={item.key} role="listitem">
            <button
              type="button"
              className={prefixCls('x-suggestion-item')}
              onClick={() => onSelect?.(item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

Suggestion.displayName = 'Suggestion';
