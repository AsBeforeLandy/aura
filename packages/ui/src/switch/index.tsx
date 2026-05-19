import React, { forwardRef, useState, useCallback } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SwitchProps {
  /** 开关尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否选中（受控） */
  checked?: boolean;
  /** 默认是否选中 */
  defaultChecked?: boolean;
  /** 选中时显示的内容 */
  checkedChildren?: React.ReactNode;
  /** 未选中时显示的内容 */
  unCheckedChildren?: React.ReactNode;
  /** 切换回调 */
  onChange?: (checked: boolean) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      size = 'md',
      disabled = false,
      loading = false,
      checked: controlledChecked,
      defaultChecked = false,
      checkedChildren,
      unCheckedChildren,
      onChange,
      className,
      style,
    },
    ref,
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleClick = useCallback(() => {
      if (disabled || loading) return;
      if (!isControlled) {
        setInternalChecked(!checked);
      }
      onChange?.(!checked);
    }, [checked, disabled, loading, isControlled, onChange]);

    const cls = classNames(
      prefixCls('switch'),
      prefixCls(`switch-${size}`),
      checked && prefixCls('switch-checked'),
      disabled && prefixCls('switch-disabled'),
      loading && prefixCls('switch-loading'),
      className,
    );

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        className={cls}
        style={style}
        onClick={handleClick}
        disabled={disabled}
      >
        <span className={prefixCls('switch-inner')}>
          {checked ? checkedChildren : unCheckedChildren}
        </span>
        <span className={prefixCls('switch-handle')}>
          {loading && <span className={prefixCls('switch-loading-icon')} />}
        </span>
      </button>
    );
  },
);

Switch.displayName = 'Switch';
