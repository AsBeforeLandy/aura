import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 输入框变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'filled' | 'bordered';
  /** 输入框尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否自适应高度
   *  true 时自动调整，也可指定 { minRows, maxRows }
   */
  autoSize?: boolean | { minRows: number; maxRows: number };
  /** 是否显示字符计数 */
  showCount?: boolean;
  /** 最大字符长度 */
  maxLength?: number;
  /** 校验状态
   *  @default 'default'
   */
  status?: 'default' | 'error' | 'warning';
}

/**
 * 根据行数计算 textarea 高度（像素）
 */
function calculateHeight(
  textarea: HTMLTextAreaElement,
  rows: number,
): number {
  const computedStyle = window.getComputedStyle(textarea);
  const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
  return lineHeight * rows + paddingTop + paddingBottom;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      size = 'md',
      autoSize,
      showCount = false,
      maxLength,
      status = 'default',
      disabled = false,
      className,
      value,
      defaultValue,
      onChange,
      rows = 4,
      ...rest
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [internalValue, setInternalValue] = useState(
      defaultValue ?? '',
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value) : internalValue;

    // 合并 ref
    useImperativeHandle(ref, () => textareaRef.current!);

    // 自适应高度逻辑
    const resizeTextarea = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoSize) return;

      // 先重置高度以获取准确的 scrollHeight
      textarea.style.height = 'auto';

      const minRows = typeof autoSize === 'object' ? autoSize.minRows : 1;
      const maxRows = typeof autoSize === 'object' ? autoSize.maxRows : Infinity;

      const minHeight = calculateHeight(textarea, minRows);
      const maxHeight = calculateHeight(textarea, maxRows);
      const scrollHeight = textarea.scrollHeight;

      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
      // 隐藏溢出滚动条（当内容在范围内时）
      textarea.style.overflowY =
        scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoSize]);

    useEffect(() => {
      resizeTextarea();
    }, [currentValue, resizeTextarea]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    const cls = classNames(
      prefixCls('textarea'),
      variant !== 'default' && prefixCls(`textarea-${variant}`),
      prefixCls(`textarea-${size}`),
      status !== 'default' && prefixCls(`textarea-${status}`),
      disabled && prefixCls('textarea-disabled'),
      showCount && prefixCls('textarea-show-count'),
      className,
    );

    const currentLength = String(currentValue).length;

    return (
      <div className={cls}>
        <textarea
          ref={textareaRef}
          className={prefixCls('textarea-element')}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          {...rest}
        />
        {showCount && (
          <span className={prefixCls('textarea-count')}>
            {maxLength
              ? `${currentLength}/${maxLength}`
              : currentLength}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
