import React, { forwardRef, useState, useCallback } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  variant?: 'default' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
  status?: 'default' | 'error' | 'warning';
}

const InputBase = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      disabled = false,
      prefix: prefixNode,
      suffix: suffixNode,
      allowClear = false,
      status = 'default',
      className,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const isControlled = value !== undefined;
    const currentValue = (isControlled ? String(value ?? '') : internalValue) as string;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    const handleClear = useCallback(() => {
      if (disabled) return;
      if (!isControlled) setInternalValue('');
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    }, [disabled, isControlled, onChange]);

    const showClear = allowClear && currentValue.length > 0 && !disabled;

    const cls = classNames(
      prefixCls('input'),
      variant !== 'default' && prefixCls(`input-${variant}`),
      prefixCls(`input-${size}`),
      status !== 'default' && prefixCls(`input-${status}`),
      disabled && prefixCls('input-disabled'),
      Boolean(prefixNode) && prefixCls('input-with-prefix'),
      (Boolean(suffixNode) || allowClear) && prefixCls('input-with-suffix'),
      className,
    );

    return (
      <div className={cls}>
        {prefixNode && (
          <span className={prefixCls('input-prefix')}>{prefixNode}</span>
        )}
        <input
          ref={ref}
          className={prefixCls('input-element')}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          disabled={disabled}
          {...rest}
        />
        {showClear && (
          <span className={prefixCls('input-clear')} onClick={handleClear} role="button" aria-label="清除">
            &times;
          </span>
        )}
        {!showClear && suffixNode && (
          <span className={prefixCls('input-suffix')}>{suffixNode}</span>
        )}
      </div>
    );
  },
);

InputBase.displayName = 'Input';

/* ===== Input.Password ===== */

export interface PasswordProps extends Omit<InputProps, 'type'> {
  defaultVisible?: boolean;
}

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ defaultVisible = false, ...rest }, ref) => {
    const [visible, setVisible] = useState(defaultVisible);
    const suffix = (
      <span
        className={classNames(prefixCls('input-eye'), visible && prefixCls('input-eye-visible'))}
        onClick={() => setVisible((v) => !v)}
        role="button"
        aria-label={visible ? '隐藏密码' : '显示密码'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </span>
    );
    return <InputBase ref={ref} type={visible ? 'text' : 'password'} suffix={suffix} {...rest} />;
  },
);

Password.displayName = 'Input.Password';

/* ===== Input.Search ===== */

export interface SearchProps extends Omit<InputProps, 'suffix'> {
  searchButtonText?: string;
  onSearch?: (value: string) => void;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ searchButtonText = '搜索', onSearch, onKeyDown, ...rest }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSearch?.(e.currentTarget.value);
      onKeyDown?.(e);
    };
    const suffix = (
      <span className={prefixCls('input-search-btn')} role="button" aria-label="搜索">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
    );
    return <InputBase ref={ref} suffix={suffix} onKeyDown={handleKeyDown} {...rest} />;
  },
);

Search.displayName = 'Input.Search';

/* ===== Input.Group ===== */

export interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

const Group = forwardRef<HTMLDivElement, GroupProps>(
  ({ compact = false, className, children, ...rest }, ref) => {
    const cls = classNames(
      prefixCls('input-group'),
      compact && prefixCls('input-group-compact'),
      className,
    );
    return (
      <div ref={ref} className={cls} {...rest}>
        {children}
      </div>
    );
  },
);

Group.displayName = 'Input.Group';

/* ===== 复合组件导出 ===== */

interface InputComponent
  extends React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>> {
  Password: typeof Password;
  Search: typeof Search;
  Group: typeof Group;
}

const Input = InputBase as unknown as InputComponent;
Input.Password = Password;
Input.Search = Search;
Input.Group = Group;

export { Input };
