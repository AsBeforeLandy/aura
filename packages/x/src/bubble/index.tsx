import React, { useEffect, useRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface BubbleProps {
  /** 消息角色：user 渲染在右侧，assistant / system 渲染在左侧 */
  role?: 'user' | 'assistant' | 'system';
  /** 消息内容（纯文本）；需要 Markdown 时传 contentRender */
  content?: string;
  /** 自定义内容渲染扩展点（如传 MarkdownContent） */
  contentRender?: (content: string) => React.ReactNode;
  /** 头像（放任意节点，如 @aura/ui 的 Avatar） */
  avatar?: React.ReactNode;
  /** 气泡上方的说明区（如消息来源、时间） */
  header?: React.ReactNode;
  /** 气泡下方的操作区（如复制 / 重新生成按钮） */
  footer?: React.ReactNode;
  /** 生成中：内容区显示三点打字动画，aria-busy 标记 */
  loading?: boolean;
  /** 视觉变体 */
  variant?: 'filled' | 'outlined' | 'shadow';
  className?: string;
  style?: React.CSSProperties;
}

export const BubbleBase: React.FC<BubbleProps> = ({
  role = 'assistant',
  content = '',
  contentRender,
  avatar,
  header,
  footer,
  loading = false,
  variant = 'filled',
  className,
  style,
}) => {
  // user 在右（end），assistant / system 在左（start）
  const placement = role === 'user' ? 'end' : 'start';
  const rootClass = classNames(
    prefixCls('x-bubble'),
    prefixCls(`x-bubble--${placement}`),
    prefixCls(`x-bubble--${variant}`),
    className,
  );

  return (
    <div className={rootClass} data-role={role} style={style} aria-busy={loading || undefined}>
      {avatar ? <div className={prefixCls('x-bubble-avatar')}>{avatar}</div> : null}
      <div className={prefixCls('x-bubble-main')}>
        {header ? <div className={prefixCls('x-bubble-header')}>{header}</div> : null}
        <div
          className={classNames(
            prefixCls('x-bubble-content'),
            loading && prefixCls('x-bubble-content-loading'),
          )}
        >
          {loading ? (
            <span className={prefixCls('x-bubble-dots')} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : contentRender ? (
            contentRender(content)
          ) : (
            <span className={prefixCls('x-bubble-text')}>{content}</span>
          )}
        </div>
        {footer ? <div className={prefixCls('x-bubble-footer')}>{footer}</div> : null}
      </div>
    </div>
  );
};

BubbleBase.displayName = 'Bubble';

export interface BubbleListItem extends BubbleProps {
  /** 列表内唯一键 */
  key: React.Key;
}

export interface BubbleListProps {
  items: BubbleListItem[];
  /**
   * items 变化时自动滚动到底部（打字机场景）。
   * 容器高度由使用方控制（如 style={{ maxHeight: 320 }}），超出部分内部滚动。
   * @default true
   */
  autoScroll?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BubbleList: React.FC<BubbleListProps> = ({
  items,
  autoScroll = true,
  className,
  style,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, autoScroll]);

  return (
    <div
      ref={listRef}
      className={classNames(prefixCls('x-bubble-list'), className)}
      style={style}
    >
      {items.map(({ key, ...rest }) => (
        <BubbleBase key={key} {...rest} />
      ))}
    </div>
  );
};

BubbleList.displayName = 'BubbleList';

/** Bubble（含 Bubble.List 复合导出，与 antd X 的用法对齐） */
export const Bubble = Object.assign(BubbleBase, { List: BubbleList }) as React.FC<BubbleProps> & {
  List: typeof BubbleList;
};
