import React, { useCallback, useState } from 'react';
import { Button, Input } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SenderProps {
  /** 受控值；与 defaultValue 二选一 */
  value?: string;
  /** 非受控初值 */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 提交回调（Enter 或点击发送；空白内容不会触发） */
  onSubmit?: (content: string) => void;
  /** 取消回调：loading 时点击「停止」触发 */
  onCancel?: () => void;
  /** 生成中：按钮变为「停止」，Enter 不再提交 */
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /**
   * 提交后是否清空输入（仅非受控模式生效）
   * @default true
   */
  clearOnSubmit?: boolean;
  autoFocus?: boolean;
  /**
   * 提交键位：
   * - `enter`：Enter 提交，Shift + Enter 换行（默认）
   * - `shiftEnter`：Shift + Enter 提交，Enter 换行
   * @default 'enter'
   */
  submitType?: 'enter' | 'shiftEnter';
  /** textarea 行数范围（透传 antd autoSize） */
  autoSize?: { minRows?: number; maxRows?: number };
  /** 顶部插槽（如附件条、提示条） */
  header?: React.ReactNode;
  /** 底部插槽（如字数统计、免责声明） */
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Sender — 对话输入框。
 *
 * - Enter 提交，Shift + Enter 换行，中文输入法组合中不提交；
 * - loading 时按钮变为「停止」，点击触发 onCancel，Enter 不再提交；
 * - 受控 / 非受控两种用法。
 */
export const Sender: React.FC<SenderProps> = ({
  value,
  defaultValue = '',
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  placeholder = '输入消息，Enter 发送，Shift + Enter 换行',
  disabled = false,
  clearOnSubmit = true,
  autoFocus = false,
  submitType = 'enter',
  autoSize = { minRows: 1, maxRows: 6 },
  header,
  footer,
  className,
  style,
}) => {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;

  const triggerSubmit = useCallback(() => {
    if (disabled || loading) return;
    if (!current.trim()) return;
    onSubmit?.(current);
    if (!isControlled && clearOnSubmit) setInner('');
  }, [current, disabled, loading, isControlled, clearOnSubmit, onSubmit]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInner(event.target.value);
    onChange?.(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 中文输入法组词过程中不提交
    if (event.nativeEvent.isComposing) return;
    if (event.key !== 'Enter') return;

    const shouldSubmit =
      submitType === 'enter' ? !event.shiftKey : Boolean(event.shiftKey);
    if (shouldSubmit) {
      event.preventDefault();
      triggerSubmit();
    }
  };

  return (
    <div
      className={classNames(
        prefixCls('x-sender'),
        disabled && prefixCls('x-sender--disabled'),
        className,
      )}
      style={style}
    >
      {header ? <div className={prefixCls('x-sender-header')}>{header}</div> : null}
      <Input.TextArea
        value={current}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoSize={autoSize}
        aria-label="消息输入框"
      />
      <div className={prefixCls('x-sender-actions')}>
        <Button
          type="primary"
          shape="round"
          disabled={disabled}
          onClick={loading ? onCancel : triggerSubmit}
          aria-label={loading ? '停止生成' : '发送'}
        >
          {loading ? '停止' : '发送'}
        </Button>
      </div>
      {footer ? <div className={prefixCls('x-sender-footer')}>{footer}</div> : null}
    </div>
  );
};

Sender.displayName = 'Sender';
