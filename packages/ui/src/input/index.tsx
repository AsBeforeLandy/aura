import React, { forwardRef, useState, useCallback, useRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { EyeOpen, EyeClosed, Search as SearchIcon } from '@aura/icons';
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
        {visible ? <EyeOpen size={16} /> : <EyeClosed size={16} />}
      </span>
    );
    return <InputBase ref={ref} type={visible ? 'text' : 'password'} suffix={suffix} {...rest} />;
  },
);

Password.displayName = 'Input.Password';

/* ===== Input.Search ===== */

export interface SearchProps extends Omit<InputProps, 'suffix'> {
  /**
   * 自定义搜索按钮文案。
   * 不传时展示搜索图标（默认形态）；传入时以该文案替代图标，
   * 并同时作为按钮的可访问名称。
   */
  searchButtonText?: string;
  onSearch?: (value: string) => void;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ searchButtonText, onSearch, onKeyDown, ...rest }, ref) => {
    // 持有内部 input 引用：点击按钮时需要读取当前输入值
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSearch?.(e.currentTarget.value);
      onKeyDown?.(e);
    };

    const triggerSearch = () => onSearch?.(inputRef.current?.value ?? '');

    const label = searchButtonText ?? '搜索';
    const suffix = (
      <span
        className={prefixCls('input-search-btn')}
        role="button"
        aria-label={label}
        tabIndex={0}
        onClick={triggerSearch}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerSearch();
          }
        }}
      >
        {searchButtonText ? (
          <span className={prefixCls('input-search-btn-text')}>{searchButtonText}</span>
        ) : (
          <SearchIcon size={16} />
        )}
      </span>
    );
    return (
      <InputBase
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        suffix={suffix}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    );
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
