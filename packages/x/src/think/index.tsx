import React, { useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ThinkProps {
  /** 思考内容（任意节点，长文本会内部滚动） */
  content?: React.ReactNode;
  /** 是否正在思考：标题显示「思考中…」并带动画 */
  thinking?: boolean;
  /** 思考用时（秒）：完成后标题显示「已深度思考 · x 秒」 */
  duration?: number;
  /** 默认是否展开 @default false */
  defaultExpanded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Think — 思考过程展示。
 *
 * 折叠面板形态：思考中自动展开并禁用手动收起；完成后默认折叠，
 * 点击标题可展开 / 收起查看完整思考内容。
 */
export const Think: React.FC<ThinkProps> = ({
  content,
  thinking = false,
  duration,
  defaultExpanded = false,
  className,
  style,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  // 思考中强制展开（实时可见），完成后回到用户控制的折叠态
  const isOpen = thinking ? true : expanded;

  return (
    <div
      className={classNames(
        prefixCls('x-think'),
        thinking && prefixCls('x-think--thinking'),
        className,
      )}
      style={style}
    >
      <button
        type="button"
        className={prefixCls('x-think-trigger')}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={isOpen}
        disabled={thinking}
      >
        <span className={prefixCls('x-think-caret')} aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
        {thinking ? (
          <span className={prefixCls('x-think-label')}>思考中…</span>
        ) : (
          <span className={prefixCls('x-think-label')}>
            已深度思考{duration !== undefined ? ` · ${duration} 秒` : ''}
          </span>
        )}
      </button>
      {isOpen && content ? (
        <div className={prefixCls('x-think-content')}>{content}</div>
      ) : null}
    </div>
  );
};

Think.displayName = 'Think';
