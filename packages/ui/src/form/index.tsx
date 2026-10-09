import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
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

/* ===== FormInstance（命令式实例） ===== */

/** Form 内部引擎：由 Form 在挂载时注入，FormInstance 的方法委托给它 */
interface FormEngine {
  getValues(): Record<string, unknown>;
  setFieldValue(name: string, value: unknown): void;
  setFieldsValue(values: Record<string, unknown>): void;
  validateFields(names?: string[]): Promise<Record<string, unknown>>;
  reset(): void;
}

export interface FormInstance {
  /** 获取全部字段值（浅拷贝） */
  getFieldsValue(): Record<string, unknown>;
  /** 获取单个字段值 */
  getFieldValue(name: string): unknown;
  /** 设置单个字段值 */
  setFieldValue(name: string, value: unknown): void;
  /** 批量合并字段值（编辑表单回填） */
  setFieldsValue(values: Record<string, unknown>): void;
  /**
   * 校验全部或指定字段：通过时 resolve 全部字段值，
   * 失败时 reject `FormError[]`
   */
  validateFields(names?: string | string[]): Promise<Record<string, unknown>>;
  /** 重置为 initialValues 并清空校验错误 */
  resetFields(): void;
}

/** FormInstance → 引用槽注册表：Form 借此把引擎挂到实例上，不污染公开接口 */
const engineRegistry = new WeakMap<FormInstance, { current: FormEngine | null }>();

/**
 * 创建 FormInstance。传给 `<Form form={form}>` 后即可在表单外部命令式
 * 读写与校验（编辑回填、外部提交按钮、跨组件联动等场景）。
 * 对外通过 `Form.useForm()` 使用（返回数组，与 antd 用法一致）。
 *
 * 实现说明：刻意不使用 React hooks——与 antd 一致，允许在组件外
 * （工具函数、测试、类组件）调用，仅要求把返回值传给 <Form form={...}>。
 */
function useForm(): FormInstance {
  const engineRef: { current: FormEngine | null } = { current: null };
  const instance: FormInstance = {
    getFieldsValue: () => engineRef.current?.getValues() ?? {},
    getFieldValue: (name) => engineRef.current?.getValues()[name],
    setFieldValue: (name, value) => engineRef.current?.setFieldValue(name, value),
    setFieldsValue: (values) => engineRef.current?.setFieldsValue(values),
    validateFields: async (names) => {
      const engine = engineRef.current;
      if (!engine) return {};
      return engine.validateFields(
        names === undefined ? undefined : Array.isArray(names) ? names : [names],
      );
    },
    resetFields: () => engineRef.current?.reset(),
  };
  engineRegistry.set(instance, engineRef);
  return instance;
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
  /** 自定义值属性名，例如 Switch/Checkbox 使用 'checked'，默认自动检测 */
  valuePropName?: string;
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
  valuePropName,
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
    async (e: unknown) => {
      if (!name || !ctx) return;
      
      let value: unknown = e;
      if (e && typeof e === 'object' && 'target' in e && e.target) {
        // 事件来自被克隆的子组件，此处只能按 DOM 事件的公共形态取值
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox' || target.type === 'radio') {
          value = target.type === 'checkbox' ? target.checked : target.value;
        } else {
          value = target.value;
        }
      }
      
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

  /** 克隆子元素注入 value/checked、onChange、disabled */
  const renderChildren = () => {
    if (React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const childProps = child.props;
      // 子组件可能是组件（函数 / 类，取 displayName 或 name）或宿主元素（字符串标签名）
      const childType = child.type as
        | { displayName?: string; name?: string }
        | string;
      const displayName =
        typeof childType === 'string'
          ? childType
          : childType?.displayName || childType?.name || '';
      
      const isSwitchOrCheckbox = 
        displayName === 'Switch' || 
        displayName === 'Checkbox' || 
        (typeof childType === 'string' && childType === 'input' && childProps.type === 'checkbox');
        
      const propName = valuePropName ?? (isSwitchOrCheckbox ? 'checked' : 'value');

      if (!name || !ctx) {
        return React.cloneElement(child, {
          ...(isDisabled ? { disabled: true } : {}),
          ...(ctx?.size && childProps.size === undefined ? { size: ctx.size } : {}),
        });
      }

      const value = ctx.values[name] ?? (isSwitchOrCheckbox ? false : '');

      return React.cloneElement(child, {
        [propName]: value,
        onChange: (e: unknown) => {
          handleChange(e);
          const childOnChange = childProps.onChange as
            | ((ev: unknown) => void)
            | undefined;
          childOnChange?.(e);
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
    // 刻意只在挂载时初始化一次：这里读到的 getArray / keys.length 只作初始快照，
    // 一旦加入依赖，每次表单值变化都会重跑并可能重置 keys。
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 见上
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
  /** 命令式实例（由 `Form.useForm()` 创建），用于编辑回填、外部提交等场景 */
  form?: FormInstance;
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
      form,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [values, setValues] = useState<Record<string, unknown>>({ ...initialValues });
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // valuesRef 是字段值的唯一事实来源：命令式 API 与渲染状态都从它出发，
    // 保证 setFieldsValue 后同步读取（validateFields / getFieldValue）拿到最新值
    const valuesRef = useRef<Record<string, unknown>>({ ...initialValues });
    const initialValuesRef = useRef(initialValues);
    const rulesMapRef = useRef<Record<string, RuleType[]>>({});

    /** 统一的字段值变更入口：先写 ref（同步可读），再同步渲染状态 */
    const applyValues = useCallback(
      (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
        valuesRef.current = updater(valuesRef.current);
        setValues(valuesRef.current);
      },
      [],
    );

    const setFieldValue = useCallback(
      (name: string, value: unknown) => {
        applyValues((prev) => ({ ...prev, [name]: value }));
      },
      [applyValues],
    );

    const validateField = useCallback(
      async (name: string): Promise<string[]> => {
        const rules = rulesMapRef.current[name] ?? [];
        if (rules.length === 0) return [];
        const fieldErrors = await validateRules(rules, valuesRef.current[name]);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
        return fieldErrors;
      },
      [],
    );

    const engine = useMemo<FormEngine>(
      () => ({
        getValues: () => ({ ...valuesRef.current }),
        setFieldValue: (name, value) =>
          applyValues((prev) => ({ ...prev, [name]: value })),
        setFieldsValue: (vals) =>
          applyValues((prev) => ({ ...prev, ...vals })),
        validateFields: async (names) => {
          const fieldNames = names ?? Object.keys(rulesMapRef.current);
          const allErrors: FormError[] = [];
          const newErrors: Record<string, string[]> = {};
          for (const name of fieldNames) {
            const rules = rulesMapRef.current[name];
            if (rules && rules.length > 0) {
              const fieldErrors = await validateRules(
                rules,
                valuesRef.current[name],
              );
              if (fieldErrors.length > 0) {
                newErrors[name] = fieldErrors;
                allErrors.push({ name, errors: fieldErrors });
              }
            }
          }
          // 对「本次校验过的字段」做替换式更新：通过的字段清除旧错误（与整表提交语义一致）
          setErrors((prev) => {
            const next = { ...prev };
            for (const name of fieldNames) {
              if (newErrors[name]) next[name] = newErrors[name];
              else delete next[name];
            }
            return next;
          });
          if (allErrors.length > 0) {
            throw allErrors;
          }
          return { ...valuesRef.current };
        },
        reset: () => {
          valuesRef.current = { ...initialValuesRef.current };
          setValues(valuesRef.current);
          setErrors({});
        },
      }),
      [applyValues],
    );

    // 把引擎挂到外部传入的 FormInstance 上（卸载时解绑）
    useEffect(() => {
      if (!form) return;
      const slot = engineRegistry.get(form);
      if (!slot) return;
      slot.current = engine;
      return () => {
        slot.current = null;
      };
    }, [form, engine]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const result = await engine.validateFields();
          onFinish?.(result);
        } catch (allErrors) {
          onFinishFailed?.(allErrors as FormError[]);
        }
      },
      [engine, onFinish, onFinishFailed],
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
  /** 创建 FormInstance（与 antd 用法一致：`const [form] = Form.useForm()`） */
  useForm: () => [FormInstance];
}

const Form = FormBase as unknown as FormComponent;
Form.Item = FormItem;
Form.List = FormList;
Form.useForm = () => [useForm()];

export { Form, FormItem, FormList };
export default Form;
