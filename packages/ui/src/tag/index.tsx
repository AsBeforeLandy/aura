import React, {
  forwardRef,
  useState,
  useCallback,
  createContext,
  useContext,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { Close } from '@aura/icons';
import './index.less';

/* ===== Tag Context（用于 Tag.Group） ===== */

interface TagGroupContextValue {
  /** 当前选中的值（仅在 CheckableTag 场景下使用） */
  value?: (string | number)[];
  /** 选中值变化回调 */
  onChange?: (value: (string | number)[]) => void;
}

const TagGroupContext = createContext<TagGroupContextValue | null>(null);

/* ===== Tag ===== */

export interface TagProps {
  /** 标签变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** 标签尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 标签内容 */
  children?: React.ReactNode;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      variant = 'default',
      size = 'md',
      closable = false,
      onClose,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(true);
    const [closing, setClosing] = useState(false);

    const handleClose = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        setClosing(true);
        // 等待动画结束后真正移除
        setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, 250);
      },
      [onClose],
    );

    if (!visible) return null;

    const cls = classNames(
      prefixCls('tag'),
      variant !== 'default' && prefixCls(`tag-${variant}`),
      prefixCls(`tag-${size}`),
      closing && prefixCls('tag-closing'),
      className,
    );

    return (
      <span ref={ref} className={cls} style={style}>
        <span className={prefixCls('tag-content')}>{children}</span>
        {closable && (
          <span
            className={prefixCls('tag-close')}
            onClick={handleClose}
            role="button"
            aria-label="关闭"
          >
            <Close size={12} />
          </span>
        )}
      </span>
    );
  },
);

Tag.displayName = 'Tag';

/* ===== Tag.Checkable（可选中标签） ===== */

export interface TagCheckableProps {
  /** 是否选中
   *  @default false
   */
  checked?: boolean;
  /** 选中状态变化回调 */
  onChange?: (checked: boolean) => void;
  /** 标签值（在 Group 中使用） */
  value?: string | number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 标签内容 */
  children?: React.ReactNode;
}

export const TagCheckable = forwardRef<HTMLSpanElement, TagCheckableProps>(
  (
    { checked: controlledChecked, onChange, value, className, style, children },
    ref,
  ) => {
    const groupCtx = useContext(TagGroupContext);
    const [internalChecked, setInternalChecked] = useState(false);

    const isChecked = groupCtx
      ? groupCtx.value !== undefined && value !== undefined
        ? groupCtx.value.includes(value)
        : internalChecked
      : controlledChecked ?? internalChecked;

    const handleClick = useCallback(() => {
      if (groupCtx && groupCtx.onChange && value !== undefined) {
        const nextChecked = !isChecked;
        const nextValue = nextChecked
          ? [...(groupCtx.value ?? []), value]
          : (groupCtx.value ?? []).filter((v) => v !== value);
        groupCtx.onChange(nextValue);
      } else {
        const nextChecked = !isChecked;
        if (controlledChecked === undefined) {
          setInternalChecked(nextChecked);
        }
        onChange?.(nextChecked);
      }
    }, [groupCtx, isChecked, controlledChecked, onChange, value]);

    const cls = classNames(
      prefixCls('tag'),
      prefixCls('tag-checkable'),
      isChecked && prefixCls('tag-checkable-checked'),
      className,
    );

    return (
      <span
        ref={ref}
        className={cls}
        style={style}
        onClick={handleClick}
        role="checkbox"
        aria-checked={isChecked}
      >
        <span className={prefixCls('tag-content')}>{children}</span>
      </span>
    );
  },
);

TagCheckable.displayName = 'TagCheckable';

/* ===== Tag.Group（标签组容器） ===== */

export interface TagGroupProps {
  /** 当前选中值（受控，配合 Tag.Checkable 使用） */
  value?: (string | number)[];
  /** 选中值变化回调 */
  onChange?: (value: (string | number)[]) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

export const TagGroup: React.FC<TagGroupProps> = ({
  value,
  onChange,
  className,
  style,
  children,
}) => {
  const ctx: TagGroupContextValue = { value, onChange };

  const cls = classNames(prefixCls('tag-group'), className);

  return (
    <TagGroupContext.Provider value={ctx}>
      <div className={cls} style={style}>
        {children}
      </div>
    </TagGroupContext.Provider>
  );
};

TagGroup.displayName = 'TagGroup';
