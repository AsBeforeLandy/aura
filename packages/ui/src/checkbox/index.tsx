import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== Checkbox Context（用于 Checkbox.Group） ===== */

interface CheckboxGroupContextValue {
  name?: string;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

/* ===== Checkbox ===== */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 半选状态（不确定状态） */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size,
      indeterminate = false,
      disabled,
      checked: controlledChecked,
      onChange: controlledOnChange,
      className,
      children,
      value,
      ...rest
    },
    ref,
  ) => {
    // 尝试从 Group context 获取
    const groupCtx = useContext(CheckboxGroupContext);

    const isDisabled = disabled ?? groupCtx?.disabled;
    const resolvedSize = size ?? groupCtx?.size ?? 'md';

    // 受控：group > 单独 controlled > 非受控
    let isChecked: boolean;
    let handleChange:
      | ((e: React.ChangeEvent<HTMLInputElement>) => void)
      | undefined;

    if (groupCtx) {
      // Group 模式
      const val = value as string | number;
      isChecked = groupCtx.value.includes(val);
      handleChange = () => {
        const next = isChecked
          ? groupCtx.value.filter((v) => v !== val)
          : [...groupCtx.value, val];
        groupCtx.onChange(next);
      };
    } else {
      // 单独 Checkbox 模式
      isChecked = !!controlledChecked;
      handleChange = controlledOnChange;
    }

    const cls = classNames(
      prefixCls('checkbox'),
      prefixCls(`checkbox-${resolvedSize}`),
      isChecked && prefixCls('checkbox-checked'),
      indeterminate && prefixCls('checkbox-indeterminate'),
      isDisabled && prefixCls('checkbox-disabled'),
      className,
    );

    return (
      <label className={cls}>
        <span className={prefixCls('checkbox-input-wrapper')}>
          <input
            ref={ref}
            type="checkbox"
            className={prefixCls('checkbox-input')}
            checked={indeterminate || isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            value={value}
            {...rest}
          />
          <span className={prefixCls('checkbox-inner')} />
        </span>
        {children !== undefined && (
          <span className={prefixCls('checkbox-label')}>{children}</span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

/* ===== Checkbox.Group ===== */

export interface CheckboxGroupProps {
  /** 当前值（受控） */
  value?: (string | number)[];
  /** 默认值（非受控） */
  defaultValue?: (string | number)[];
  /** 选项列表 */
  options: Array<{
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
  }>;
  /** 值变化回调 */
  onChange?: (value: (string | number)[]) => void;
  /** 排列方向
   *  @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';
  /** 是否禁用整组 */
  disabled?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  options,
  onChange,
  direction = 'horizontal',
  disabled = false,
  size,
  className,
}) => {
  const [internalValue, setInternalValue] =
    useState<(string | number)[]>(defaultValue);
  const currentValue = controlledValue ?? internalValue;

  const handleChange = (nextValue: (string | number)[]) => {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const ctx: CheckboxGroupContextValue = {
    value: currentValue,
    onChange: handleChange,
    disabled,
    size,
  };

  const cls = classNames(
    prefixCls('checkbox-group'),
    prefixCls(`checkbox-group-${direction}`),
    className,
  );

  return (
    <CheckboxGroupContext.Provider value={ctx}>
      <div className={cls}>
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';
