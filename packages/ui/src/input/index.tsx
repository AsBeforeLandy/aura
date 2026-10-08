import React, { forwardRef, useState, useCallback, useRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { EyeOpen, EyeClosed, Search as SearchIcon } from '@aura/icons';
import './index.less';

export interface InputCountConfig {
  /** 自定义字数统计文案渲染 */
  formatter?: (args: {
    value: string;
    count: number;
    maxLength?: number;
  }) => React.ReactNode;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  variant?: 'default' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
  status?: 'default' | 'error' | 'warning';
  /** 输入框前置附加内容（如 `https://`、`¥`），与 prefix 的区别是渲染在边框外 */
  addonBefore?: React.ReactNode;
  /** 输入框后置附加内容（如 `.com`、`元`），与 suffix 的区别是渲染在边框外 */
  addonAfter?: React.ReactNode;
  /** 是否显示字数统计；传对象可用 `formatter` 自定义渲染 */
  showCount?: boolean | InputCountConfig;
  /** 按下回车键的回调 */
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
      addonBefore,
      addonAfter,
      showCount = false,
      onPressEnter,
      className,
      style,
      value,
      defaultValue,
      onChange,
      onKeyDown,
      maxLength,
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

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onPressEnter?.(e);
        onKeyDown?.(e);
      },
      [onPressEnter, onKeyDown],
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

    const countConfig = typeof showCount === 'object' ? showCount : undefined;
    const showCountNode = Boolean(showCount);
    const countNode = showCountNode ? (
      <span className={prefixCls('input-count')}>
        {countConfig?.formatter ? (
          countConfig.formatter({
            value: currentValue,
            count: currentValue.length,
            maxLength,
          })
        ) : (
          <>
            {currentValue.length}
            {maxLength != null && ` / ${maxLength}`}
          </>
        )}
      </span>
    ) : null;

    const hasAddon = Boolean(addonBefore) || Boolean(addonAfter);

    const innerCls = classNames(
      prefixCls('input'),
      variant !== 'default' && prefixCls(`input-${variant}`),
      prefixCls(`input-${size}`),
      status !== 'default' && prefixCls(`input-${status}`),
      disabled && prefixCls('input-disabled'),
      Boolean(prefixNode) && prefixCls('input-with-prefix'),
      (Boolean(suffixNode) || allowClear || showCountNode) &&
        prefixCls('input-with-suffix'),
    );

    const innerInput = (
      <>
        {prefixNode && (
          <span className={prefixCls('input-prefix')}>{prefixNode}</span>
        )}
        <input
          ref={ref}
          className={prefixCls('input-element')}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={maxLength}
          {...rest}
        />
        {countNode}
        {showClear && (
          <span
            className={prefixCls('input-clear')}
            onClick={handleClear}
            role="button"
            aria-label="清除"
          >
            &times;
          </span>
        )}
        {!showClear && suffixNode && (
          <span className={prefixCls('input-suffix')}>{suffixNode}</span>
        )}
      </>
    );

    // 有 addon 时：外层包裹 addon，className / style 落在包裹层
    if (hasAddon) {
      const wrapperCls = classNames(
        prefixCls('input-group-wrapper'),
        prefixCls(`input-group-wrapper-${size}`),
        disabled && prefixCls('input-group-wrapper-disabled'),
        className,
      );
      return (
        <div className={wrapperCls} style={style}>
          {addonBefore && (
            <span className={prefixCls('input-addon')}>{addonBefore}</span>
          )}
          <div className={innerCls}>{innerInput}</div>
          {addonAfter && (
            <span className={prefixCls('input-addon')}>{addonAfter}</span>
          )}
        </div>
      );
    }

    return (
      <div className={classNames(innerCls, className)} style={style}>
        {innerInput}
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
