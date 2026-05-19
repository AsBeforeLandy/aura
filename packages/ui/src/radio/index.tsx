import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== Radio Context（用于 Radio.Group） ===== */

interface RadioGroupContextValue {
  name?: string;
  value?: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/* ===== Radio ===== */

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      size,
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
    const groupCtx = useContext(RadioGroupContext);

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
      isChecked = groupCtx.value === val;
      handleChange = () => {
        groupCtx.onChange(val);
      };
    } else {
      // 单独 Radio 模式
      isChecked = !!controlledChecked;
      handleChange = controlledOnChange;
    }

    const cls = classNames(
      prefixCls('radio'),
      prefixCls(`radio-${resolvedSize}`),
      isChecked && prefixCls('radio-checked'),
      isDisabled && prefixCls('radio-disabled'),
      className,
    );

    // 在 Group 模式下，通过 label onClick 确保点击已选中项也能触发回调
    // 因为 React 受控 radio 在 checked=true 时不会触发 input 的 onChange
    const handleLabelClick = groupCtx
      ? () => {
          if (!isDisabled) {
            groupCtx.onChange(value as string | number);
          }
        }
      : undefined;

    return (
      <label className={cls} onClick={handleLabelClick}>
        <span className={prefixCls('radio-input-wrapper')}>
          <input
            ref={ref}
            type="radio"
            className={prefixCls('radio-input')}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            value={value}
            onClick={(e) => {
              // 阻止 input 的默认 click 事件冒泡到 label 的 onClick，
              // 避免 Group 模式下重复触发
              if (groupCtx) {
                e.stopPropagation();
              }
            }}
            {...rest}
          />
          <span className={prefixCls('radio-inner')} />
        </span>
        {children !== undefined && (
          <span className={prefixCls('radio-label')}>{children}</span>
        )}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

/* ===== Radio.Group ===== */

export interface RadioGroupProps {
  /** 当前值（受控） */
  value?: string | number;
  /** 默认值（非受控） */
  defaultValue?: string | number;
  /** 选项列表 */
  options: Array<{
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
  }>;
  /** 值变化回调 */
  onChange?: (value: string | number) => void;
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

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value: controlledValue,
  defaultValue,
  options,
  onChange,
  direction = 'horizontal',
  disabled = false,
  size,
  className,
}) => {
  const [internalValue, setInternalValue] = useState<string | number>(
    defaultValue ?? '',
  );
  const currentValue = controlledValue ?? internalValue;

  const handleChange = (nextValue: string | number) => {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const ctx: RadioGroupContextValue = {
    value: currentValue,
    onChange: handleChange,
    disabled,
    size,
  };

  const cls = classNames(
    prefixCls('radio-group'),
    prefixCls(`radio-group-${direction}`),
    className,
  );

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div className={cls}>
        {options.map((opt) => (
          <Radio
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </Radio>
        ))}
      </div>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';
