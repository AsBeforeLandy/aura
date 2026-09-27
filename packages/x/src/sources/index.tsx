import React, { useCallback, useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SourcesItem {
  /** 唯一键；缺省用索引 */
  key?: React.Key;
  title: React.ReactNode;
  /** 有 url 时整项渲染为外链 */
  url?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
}

export interface SourcesProps {
  /** 头部标题；缺省按条数生成「已引用 N 个来源」 */
  title?: React.ReactNode;
  items: SourcesItem[];
  /** 折叠图标位置 @default 'start' */
  expandIconPosition?: 'start' | 'end';
  /** 非受控默认展开态 @default true */
  defaultExpanded?: boolean;
  /** 受控展开态 */
  expanded?: boolean;
  onExpand?: (expanded: boolean) => void;
  /** 点击某条来源（外链与按钮都会触发） */
  onClick?: (item: SourcesItem) => void;
  /** 行内模式：渲染为上标序号，悬停 / 聚焦时浮出来源详情 @default false */
  inline?: boolean;
  /** 行内模式下强制激活的项（受控） */
  activeKey?: React.Key;
  /** 行内弹层宽度 @default 300 */
  popoverOverlayWidth?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/** 头部默认标题：按条数生成，无来源时不展示头部 */
function defaultTitle(count: number): string {
  return `已引用 ${count} 个来源`;
}

/**
 * Sources — 来源引用。
 *
 * 联网搜索 / RAG 场景下展示答案引用到的数据来源：头部一行摘要 + 有序列表。
 * 每项支持图标、标题、外链与描述；`inline` 模式改为正文中的上标序号，
 * 悬停或聚焦时浮出详情，适合与段落混排。
 */
export const Sources: React.FC<SourcesProps> = ({
  title,
  items,
  expandIconPosition = 'start',
  defaultExpanded = true,
  expanded,
  onExpand,
  onClick,
  inline = false,
  activeKey,
  popoverOverlayWidth = 300,
  className,
  style,
}) => {
  const [innerOpen, setInnerOpen] = useState(defaultExpanded);
  const [hoveredKey, setHoveredKey] = useState<React.Key | null>(null);
  const isOpenControlled = expanded !== undefined;
  const isOpen = isOpenControlled ? expanded : innerOpen;

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (!isOpenControlled) setInnerOpen(next);
    onExpand?.(next);
  }, [isOpen, isOpenControlled, onExpand]);

  const keyOf = (item: SourcesItem, index: number) => item.key ?? index;

  /** 单条来源的正文（序号 + 图标 + 标题） */
  const renderBody = (item: SourcesItem, index: number) => (
    <>
      <span className={prefixCls('x-sources-item-index')} aria-hidden="true">
        {index + 1}
      </span>
      {item.icon ? (
        <span className={prefixCls('x-sources-item-icon')} aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className={prefixCls('x-sources-item-title')}>{item.title}</span>
    </>
  );

  // 空列表渲染 null（与 Suggestion / Attachments 的约定一致）
  if (items.length === 0) return null;

  if (inline) {
    return (
      <span
        className={classNames(
          prefixCls('x-sources'),
          prefixCls('x-sources--inline'),
          className,
        )}
        style={style}
      >
        {items.map((item, index) => {
          const key = keyOf(item, index);
          const active = activeKey !== undefined ? activeKey === key : hoveredKey === key;
          return (
            <span
              key={key}
              className={prefixCls('x-sources-inline-wrap')}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <button
                type="button"
                className={classNames(
                  prefixCls('x-sources-inline-chip'),
                  active && prefixCls('x-sources-inline-chip--active'),
                )}
                aria-expanded={active}
                onFocus={() => setHoveredKey(key)}
                onBlur={() => setHoveredKey(null)}
                onClick={() => onClick?.(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setHoveredKey(null);
                }}
              >
                {index + 1}
              </button>
              {active ? (
                <span
                  role="tooltip"
                  className={prefixCls('x-sources-popover')}
                  style={{ width: popoverOverlayWidth }}
                >
                  <span className={prefixCls('x-sources-popover-title')}>
                    {item.title}
                  </span>
                  {item.description ? (
                    <span className={prefixCls('x-sources-popover-desc')}>
                      {item.description}
                    </span>
                  ) : null}
                  {item.url ? (
                    <a
                      className={prefixCls('x-sources-popover-url')}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.url}
                    </a>
                  ) : null}
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <div
      className={classNames(prefixCls('x-sources'), className)}
      style={style}
    >
      <button
        type="button"
        className={classNames(
          prefixCls('x-sources-header'),
          prefixCls(`x-sources-header--${expandIconPosition}`),
        )}
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <span className={prefixCls('x-sources-caret')} aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
        <span className={prefixCls('x-sources-title')}>
          {title ?? defaultTitle(items.length)}
        </span>
      </button>

      {isOpen ? (
        <ol className={prefixCls('x-sources-list')}>
          {items.map((item, index) => {
            const key = keyOf(item, index);
            const body = renderBody(item, index);
            return (
              <li key={key} className={prefixCls('x-sources-item')}>
                {item.url ? (
                  <a
                    className={prefixCls('x-sources-item-main')}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onClick?.(item)}
                  >
                    {body}
                  </a>
                ) : onClick ? (
                  <button
                    type="button"
                    className={prefixCls('x-sources-item-main')}
                    onClick={() => onClick(item)}
                  >
                    {body}
                  </button>
                ) : (
                  <span className={prefixCls('x-sources-item-main')}>{body}</span>
                )}
                {item.description ? (
                  <div className={prefixCls('x-sources-item-desc')}>
                    {item.description}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
};

Sources.displayName = 'Sources';
