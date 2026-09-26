import React, { useCallback, useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export type ThoughtChainStatus = 'pending' | 'thinking' | 'success' | 'error';

export interface ThoughtChainItem {
  /** 唯一键；缺省用索引 */
  key?: React.Key;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 步骤状态 */
  status?: ThoughtChainStatus;
  /** 自定义状态节点内容；缺省按 status 渲染内置图标 */
  icon?: React.ReactNode;
}

export interface ThoughtChainProps {
  items: ThoughtChainItem[];
  /** 是否可折叠（显示头部摘要行）；不可折叠时平铺展示 @default true */
  collapsible?: boolean;
  /** 受控展开态；传入后由外部完全控制 */
  expanded?: boolean;
  /** 非受控默认展开态 @default false */
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  /** 头部标题 @default '思维链' */
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** 按状态渲染的默认节点字符（装饰性，节点语义由文字承担） */
const NODE_GLYPH: Record<ThoughtChainStatus, string | null> = {
  pending: null,
  thinking: null,
  success: '✓',
  error: '×',
};

/** 折叠头部的状态摘要：进行中 / 已完成 / 含有失败步骤 / 共 N 步 */
function getSummary(items: ThoughtChainItem[]): string {
  if (items.length === 0) return '暂无步骤';
  const done = items.filter((item) => (item.status ?? 'pending') === 'success').length;
  if (items.some((item) => item.status === 'thinking')) return '进行中';
  if (items.some((item) => item.status === 'error')) return '含有失败步骤';
  return done === items.length ? '已完成' : `共 ${items.length} 步`;
}

/**
 * ThoughtChain — 思维链。
 *
 * 时间线形态展示模型的推理步骤：每一步一个状态节点（待办 / 进行中 /
 * 成功 / 失败）与标题、描述。默认折叠为一行摘要（进行中强制展开），
 * 点击头部可回看完整链路。
 */
export const ThoughtChain: React.FC<ThoughtChainProps> = ({
  items,
  collapsible = true,
  expanded,
  defaultExpanded = false,
  onExpandChange,
  title = '思维链',
  className,
  style,
}) => {
  const [innerOpen, setInnerOpen] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const baseOpen = isControlled ? expanded : innerOpen;
  // 有步骤进行中时强制展开（链路实时可见），完成后回到用户控制的折叠态
  const forceOpen = items.some((item) => item.status === 'thinking');
  const isOpen = forceOpen || baseOpen;

  const toggle = useCallback(() => {
    if (forceOpen) return;
    const next = !baseOpen;
    if (!isControlled) setInnerOpen(next);
    onExpandChange?.(next);
  }, [baseOpen, forceOpen, isControlled, onExpandChange]);

  const renderList = () => (
    <ol className={prefixCls('x-thought-chain-list')}>
      {items.map((item, index) => {
        const status = item.status ?? 'pending';
        const glyph = item.icon ?? NODE_GLYPH[status];
        return (
          <li
            key={item.key ?? index}
            className={classNames(
              prefixCls('x-thought-chain-item'),
              prefixCls(`x-thought-chain-item--${status}`),
            )}
          >
            <span
              className={classNames(
                prefixCls('x-thought-chain-node'),
                prefixCls(`x-thought-chain-node--${status}`),
              )}
              aria-hidden="true"
            >
              {glyph}
            </span>
            <div className={prefixCls('x-thought-chain-content')}>
              <div className={prefixCls('x-thought-chain-item-title')}>
                {item.title}
              </div>
              {item.description ? (
                <div className={prefixCls('x-thought-chain-item-desc')}>
                  {item.description}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (!collapsible) {
    return (
      <div
        className={classNames(
          prefixCls('x-thought-chain'),
          prefixCls('x-thought-chain--plain'),
          className,
        )}
        style={style}
      >
        {renderList()}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        prefixCls('x-thought-chain'),
        prefixCls('x-thought-chain--collapsible'),
        forceOpen && prefixCls('x-thought-chain--running'),
        className,
      )}
      style={style}
    >
      <button
        type="button"
        className={prefixCls('x-thought-chain-header')}
        onClick={toggle}
        aria-expanded={isOpen}
        disabled={forceOpen}
      >
        <span className={prefixCls('x-thought-chain-title')}>{title}</span>
        <span className={prefixCls('x-thought-chain-summary')}>
          {getSummary(items)}
        </span>
        <span
          className={prefixCls('x-thought-chain-caret')}
          aria-hidden="true"
        >
          {isOpen ? '▾' : '▸'}
        </span>
      </button>
      {isOpen ? renderList() : null}
    </div>
  );
};

ThoughtChain.displayName = 'ThoughtChain';
