import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== 类型定义 ===== */

export interface FormError {
  name: string;
  errors: string[];
}

export interface RuleType {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: unknown) => boolean | Promise<boolean>;
}

export interface FormListFieldData {
  key: number;
  name: number;
}

export interface FormListOperation {
  add: (defaultValue?: Record<string, unknown>) => void;
  remove: (index: number) => void;
}

interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  setFieldValue: (name: string, value: unknown) => void;
  validateField: (name: string) => Promise<string[]>;
  registerField: (name: string, rules?: RuleType[]) => void;
  layout: 'horizontal' | 'vertical' | 'inline';
  disabled: boolean;
  colon: boolean;
  size: 'sm' | 'md' | 'lg';
  labelAlign: 'left' | 'right';
}

/* ===== Context ===== */

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext() {
  const ctx = useContext(FormContext);
  return ctx;
}

/* ===== Form.Item ===== */

export interface FormItemProps {
  /** 字段名称 */
  name?: string;
  /** 标签文本 */
  label?: React.ReactNode;
  /** 标签对齐方式，覆盖 Form 级别 */
  labelAlign?: 'left' | 'right';
  /** 标签宽度，仅在 horizontal 模式下生效 */
  labelWidth?: number | string;
  /** 验证规则 */
  rules?: RuleType[];
  /** 是否必填（仅显示星号，实际验证由 rules 控制） */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 无样式模式，不渲染 Form.Item 的标签、布局和错误信息 */
  noStyle?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  labelAlign: itemLabelAlign,
  labelWidth,
  rules,
  required,
  disabled: itemDisabled,
  noStyle = false,
  className,
  style,
  children,
}) => {
  const ctx = useFormContext();
  const [localErrors, setLocalErrors] = useState<string[]>([]);

  const isRequired = required ?? rules?.some((r) => r.required) ?? false;
  const fieldErrors = name && ctx ? (ctx.errors[name] ?? localErrors) : localErrors;
  const isDisabled = itemDisabled ?? ctx?.disabled ?? false;
  const colon = ctx?.colon ?? false;
  const labelAlign = itemLabelAlign ?? ctx?.labelAlign ?? 'right';

  // 挂载时注册字段 rules 到 Form
  useEffect(() => {
    if (name && ctx && rules && rules.length > 0) {
      ctx.registerField(name, rules);
    }
  }, [name, ctx, rules]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (!name || !ctx) return;
      const value = e.target.value;
      ctx.setFieldValue(name, value);

      // 实时验证
      if (rules && rules.length > 0) {
        const errors = await validateRules(rules, value);
        setLocalErrors(errors);
      }
    },
    [name, ctx, rules],
  );

  const itemCls = classNames(
    prefixCls('form-item'),
    prefixCls(`form-item-${ctx?.layout ?? 'vertical'}`),
    fieldErrors.length > 0 && prefixCls('form-item-error'),
    isRequired && prefixCls('form-item-required'),
    isDisabled && prefixCls('form-item-disabled'),
    className,
  );

  const labelStyle: React.CSSProperties = {};
  if (labelWidth !== undefined && ctx?.layout === 'horizontal') {
    labelStyle.width = labelWidth;
    labelStyle.flexShrink = 0;
  }

  /** 克隆子元素注入 value、onChange、disabled */
  const renderChildren = () => {
    if (!name || !ctx) {
      if (React.isValidElement(children)) {
        const childProps = (children as React.ReactElement<any>).props;
        return React.cloneElement(children as React.ReactElement<any>, {
          ...(isDisabled ? { disabled: true } : {}),
          ...(ctx?.size && childProps.size === undefined ? { size: ctx.size } : {}),
        });
      }
      return children;
    }

    const value = ctx.values[name] ?? '';

    if (React.isValidElement(children)) {
      const childProps = (children as React.ReactElement<any>).props;
      return React.cloneElement(children as React.ReactElement<any>, {
        value,
        onChange: (e: React.ChangeEvent<any>) => {
          handleChange(e);
          if (childProps.onChange) {
            childProps.onChange(e);
          }
        },
        ...(isDisabled ? { disabled: true } : {}),
        ...(ctx.size && childProps.size === undefined ? { size: ctx.size } : {}),
      });
    }

    return children;
  };

  // noStyle 模式：只注入 value/onChange/disabled，不渲染外层结构和标签
  if (noStyle) {
    return <>{renderChildren()}</>;
  }

  return (
    <div className={itemCls} style={style}>
      {label && (
        <label
          className={classNames(
            prefixCls('form-item-label'),
            labelAlign === 'left' && prefixCls('form-item-label-left'),
          )}
          htmlFor={name}
          style={labelStyle}
        >
          {isRequired && <span className={prefixCls('form-item-required-star')}>*</span>}
          {label}
          {colon && <span className={prefixCls('form-item-colon')}>:</span>}
        </label>
      )}
      <div className={prefixCls('form-item-control')}>
        <div className={prefixCls('form-item-input')}>{renderChildren()}</div>
        {fieldErrors.length > 0 && (
          <div className={prefixCls('form-item-errors')} role="alert">
            {fieldErrors.map((error, index) => (
              <div key={index} className={prefixCls('form-item-error-text')}>
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'FormItem';

/* ===== Form.List ===== */

export interface FormListProps {
  /** 字段名，对应 values 中的数组 */
  name: string;
  /** 紧凑模式，相邻输入框无圆角看起来一体 */
  compact?: boolean;
  /** 渲染函数 */
  children: (fields: FormListFieldData[], operations: FormListOperation) => React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

let listKeyCounter = 0;

const FormList: React.FC<FormListProps> = ({ name, compact, children, className, style }) => {
  const ctx = useFormContext();
  const [keys, setKeys] = useState<number[]>([]);

  const getArray = useCallback((): unknown[] => {
    if (!ctx) return [];
    const val = ctx.values[name];
    return Array.isArray(val) ? val : [];
  }, [ctx, name]);

  // 初始化 keys 与 values
  useEffect(() => {
    const arr = getArray();
    if (arr.length > 0 && keys.length === 0) {
      setKeys(arr.map(() => ++listKeyCounter));
    }
  }, []);

  const add = useCallback((defaultValue?: Record<string, unknown>) => {
    const newKey = ++listKeyCounter;
    setKeys((prev) => [...prev, newKey]);
    if (ctx) {
      const arr = getArray();
      ctx.setFieldValue(name, [...arr, defaultValue ?? {}]);
    }
  }, [ctx, name, getArray]);

  const remove = useCallback((index: number) => {
    setKeys((prev) => prev.filter((_, i) => i !== index));
    if (ctx) {
      const arr = getArray();
      ctx.setFieldValue(name, arr.filter((_, i) => i !== index));
    }
  }, [ctx, name, getArray]);

  const fields: FormListFieldData[] = keys.map((key, index) => ({ key, name: index }));

  const listCls = classNames(
    prefixCls('form-list'),
    compact && prefixCls('form-list-compact'),
    className,
  );

  return (
    <div className={listCls} style={style}>
      {children(fields, { add, remove })}
    </div>
  );
};

FormList.displayName = 'Form.List';

/* ===== 验证工具 ===== */

async function validateRules(
  rules: RuleType[],
  value: unknown,
): Promise<string[]> {
  const errors: string[] = [];
  const strValue = String(value ?? '');

  for (const rule of rules) {
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(rule.message ?? '此字段为必填项');
      continue;
    }

    if (rule.min !== undefined && strValue.length < rule.min) {
      errors.push(rule.message ?? `最少输入 ${rule.min} 个字符`);
      continue;
    }

    if (rule.max !== undefined && strValue.length > rule.max) {
      errors.push(rule.message ?? `最多输入 ${rule.max} 个字符`);
      continue;
    }

    if (rule.pattern && !rule.pattern.test(strValue)) {
      errors.push(rule.message ?? '格式不正确');
      continue;
    }

    if (rule.validator) {
      try {
        const result = await rule.validator(value);
        if (!result) {
          errors.push(rule.message ?? '验证失败');
        }
      } catch {
        errors.push(rule.message ?? '验证失败');
      }
    }
  }

  return errors;
}

/* ===== Form 主组件 ===== */

export interface FormProps {
  /** 布局方式
   *  @default 'vertical'
   */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 初始值 */
  initialValues?: Record<string, unknown>;
  /** 提交成功回调 */
  onFinish?: (values: Record<string, unknown>) => void;
  /** 提交失败回调 */
  onFinishFailed?: (errors: FormError[]) => void;
  /** 标签对齐方式
   *  @default 'right'
   */
  labelAlign?: 'left' | 'right';
  /** 是否在标签后显示冒号
   *  @default false
   */
  colon?: boolean;
  /** 是否禁用所有表单项 */
  disabled?: boolean;
  /** 表单尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const FormBase = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      layout = 'vertical',
      initialValues = {},
      onFinish,
      onFinishFailed,
      labelAlign = 'right',
      colon = false,
      disabled = false,
      size = 'md',
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [values, setValues] = useState<Record<string, unknown>>({ ...initialValues });
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const rulesMapRef = useRef<Record<string, RuleType[]>>({});

    const setFieldValue = useCallback((name: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    const validateField = useCallback(
      async (name: string): Promise<string[]> => {
        const rules = rulesMapRef.current[name] ?? [];
        if (rules.length === 0) return [];
        const fieldErrors = await validateRules(rules, values[name]);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
        return fieldErrors;
      },
      [values],
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        const allErrors: FormError[] = [];
        const newErrors: Record<string, string[]> = {};

        const fieldNames = Object.keys(rulesMapRef.current);
        for (const name of fieldNames) {
          const rules = rulesMapRef.current[name];
          if (rules && rules.length > 0) {
            const fieldErrors = await validateRules(rules, values[name]);
            if (fieldErrors.length > 0) {
              newErrors[name] = fieldErrors;
              allErrors.push({ name, errors: fieldErrors });
            }
          }
        }

        setErrors(newErrors);

        if (allErrors.length > 0) {
          onFinishFailed?.(allErrors);
        } else {
          onFinish?.(values);
        }
      },
      [values, onFinish, onFinishFailed],
    );

    const registerField = useCallback((name: string, rules?: RuleType[]) => {
      if (rules && rules.length > 0) {
        rulesMapRef.current[name] = rules;
      }
    }, []);

    const ctxValue: FormContextValue = {
      values,
      errors,
      setFieldValue,
      validateField,
      registerField,
      layout,
      disabled,
      colon,
      size,
      labelAlign,
    };

    const formCls = classNames(
      prefixCls('form'),
      prefixCls(`form-${layout}`),
      prefixCls(`form-${size}`),
      className,
    );

    return (
      <FormContext.Provider value={ctxValue}>
        <form ref={ref} className={formCls} style={style} onSubmit={handleSubmit} noValidate>
          {children}
        </form>
      </FormContext.Provider>
    );
  },
);

FormBase.displayName = 'Form';

/* ===== 复合组件 ===== */

interface FormComponent
  extends React.ForwardRefExoticComponent<
    FormProps & React.RefAttributes<HTMLFormElement>
  > {
  Item: typeof FormItem;
  List: typeof FormList;
}

const Form = FormBase as unknown as FormComponent;
Form.Item = FormItem;
Form.List = FormList;

export { Form, FormItem, FormList };
export default Form;
