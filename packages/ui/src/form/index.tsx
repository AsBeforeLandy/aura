import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useSyncExternalStore,
} from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import {
  FormStore,
  type FormError,
  type FieldMeta,
  type Values,
} from './formStore';
import type { RuleType } from './rules';
import './index.less';

export type { FormError, RuleType };
export { FormStore } from './formStore';

/* ===== 类型定义 ===== */

export interface FormListFieldData {
  key: number;
  name: number;
}

export interface FormListOperation {
  add: (defaultValue?: Record<string, unknown>, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

/** FormStore 的命令式门面（antd FormInstance 的常用子集） */
export interface FormInstance {
  getFieldsValue(): Values;
  getFieldValue(name: string): unknown;
  setFieldValue(name: string, value: unknown): void;
  setFieldsValue(values: Values): void;
  validateFields(names?: string | string[]): Promise<Values>;
  resetFields(): void;
  getFieldError(name: string): string[];
  getFieldsError(): Record<string, string[]>;
  /** 直接设置字段的错误 / touched / value */
  setFields(
    updates: Record<
      string,
      { errors?: string[] | null; touched?: boolean; value?: unknown }
    >,
  ): void;
  isFieldTouched(name: string): boolean;
  isFieldsTouched(names?: string[]): boolean;
  /** 滚动到指定字段的表单项 */
  scrollToField(name: string): void;
}

/** FormInstance → store 注册表 */
const instanceStore = new WeakMap<FormInstance, FormStore>();

const noopSubscribe = () => () => {};

/**
 * 创建 FormInstance（antd 用法一致：`const [form] = Form.useForm()`）。
 * 不依赖 React hooks —— 允许在组件外调用，仅要求传给 `<Form form={...}>`。
 */
function useForm(): [FormInstance] {
  return [createFormInstance()];
}

function createFormInstance(storeArg?: FormStore): FormInstance {
  const store = storeArg ?? new FormStore();
  const instance: FormInstance = {
    getFieldsValue: () => store.getFieldsValue(),
    getFieldValue: (name) => store.getValue(name),
    setFieldValue: (name, value) => store.setFieldValue(name, value),
    setFieldsValue: (values) => store.setFieldsValue(values),
    validateFields: async (names) => {
      const targets =
        names === undefined
          ? undefined
          : Array.isArray(names)
            ? names
            : [names];
      return store.validateFields(targets);
    },
    resetFields: () => store.resetFields(),
    getFieldError: (name) => store.getFieldError(name),
    getFieldsError: () => store.getFieldsError(),
    setFields: (updates) => store.setFields(updates),
    isFieldTouched: (name) => store.isFieldTouched(name),
    isFieldsTouched: (names) => store.isFieldsTouched(names),
    scrollToField: (name) => scrollToFormItem(name),
  };
  instanceStore.set(instance, store);
  return instance;
}

function scrollToFormItem(name: string) {
  requestAnimationFrame(() => {
    const items = document.querySelectorAll<HTMLElement>(
      `.${prefixCls('form-item')}[data-field-name="${name}"]`,
    );
    // jsdom 等测试环境没有 scrollIntoView
    items[0]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  });
}

/* ===== Context ===== */

type Layout = 'horizontal' | 'vertical' | 'inline';
type Size = 'sm' | 'md' | 'lg';
type RequiredMark = boolean | 'optional';

export interface ColConfig {
  /** 占用栏数（共 24 栏） */
  span?: number;
  /** 左侧空出的栏数 */
  offset?: number;
}

interface ItemReportContextValue {
  /** noStyle 字段错误冒泡：向最近的「有样式」Item 注册后代字段 */
  registerDescendant: (path: string) => () => void;
}

const ItemReportContext = createContext<ItemReportContextValue | null>(null);

interface FormContextValue {
  store: FormStore;
  instance?: FormInstance;
  labelCol?: ColConfig;
  wrapperCol?: ColConfig;
  layout: Layout;
  disabled: boolean;
  colon: boolean;
  size: Size;
  labelAlign: 'left' | 'right';
  requiredMark: RequiredMark;
}

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext() {
  return useContext(FormContext);
}

/* ===== Form.useWatch ===== */

/**
 * 订阅某个字段的值（联动渲染）。form 缺省时使用最近 Form 上下文。
 * 注意：watch 的值应为原始类型（string/number/boolean），对象类型
 * 每次快照都是新引用，会导致渲染循环。
 */
function useWatch(path: string, form?: FormInstance): unknown {
  const ctx = useFormContext();
  const store = (form ? instanceStore.get(form) : undefined) ?? ctx?.store;

  const subscribe = useCallback(
    (listener: () => void) => store?.subscribe(listener) ?? noopSubscribe(),
    [store],
  );
  const getSnapshot = useCallback(() => store?.getValue(path), [store, path]);

  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
}

/** 获取最近 Form 的命令式实例（必须在 <Form> 内使用） */
function useFormInstance(): FormInstance {
  const ctx = useFormContext();
  if (!ctx?.instance) {
    throw new Error('Form.useFormInstance 必须在 <Form> 内使用');
  }
  return ctx.instance;
}

/* ===== Form.Item ===== */

export interface FormItemProps {
  /** 字段名称，支持嵌套点路径（'user.name'） */
  name?: string;
  /** 标签文本 */
  label?: React.ReactNode;
  /** 标签对齐方式，覆盖 Form 级别 */
  labelAlign?: 'left' | 'right';
  /** 标签宽度，仅在 horizontal 模式下生效 */
  labelWidth?: number | string;
  /** 是否显示冒号，覆盖 Form 级别（空占位 label 时传 false 隐藏） */
  colon?: boolean;
  /** 布局方式，覆盖 Form 级别 */
  layout?: Layout;
  /** label 的提示信息（问号图标，悬浮展示） */
  tooltip?: React.ReactNode;
  /** label 的 for 属性，缺省用 name */
  htmlFor?: string;
  /** 验证规则按顺序校验，遇错即停 */
  validateFirst?: boolean;
  /** 验证规则 */
  rules?: RuleType[];
  /** 是否必填（仅显示星号，实际验证由 rules 控制） */
  required?: boolean;
  /** 依赖字段：任一依赖的值变化时重新校验自身（如「确认密码」依赖「密码」） */
  dependencies?: string[];
  /** 触发校验的事件
   *  @default 'onChange'
   */
  validateTrigger?: string | string[];
  /** 自定义帮助文案（设置后覆盖校验错误信息） */
  help?: React.ReactNode;
  /** 额外说明，展示在控件下方 */
  extra?: React.ReactNode;
  /** 手动指定校验状态，优先级高于自动推导 */
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
  /** message 占位符变量（message 里 {{key}} 会被替换；label 自动注入） */
  messageVariables?: Record<string, string>;
  /** 标签栅格（horizontal 模式，共 24 栏），覆盖 Form 级别 */
  labelCol?: ColConfig;
  /** 控件区栅格（horizontal 模式），覆盖 Form 级别 */
  wrapperCol?: ColConfig;
  /** 输入值规范化：在写入 store 前调用 */
  normalize?: (
    value: unknown,
    prevValue: unknown,
    allValues: Values,
  ) => unknown;
  /** 从 onChange 事件中取值（默认自动识别 DOM 事件与裸值） */
  getValueFromEvent?: (...args: unknown[]) => unknown;
  /** 字段级初始值 */
  initialValue?: unknown;
  /** 子元素接收值的属性名（如 Switch/Checkbox 用 `checked`） */
  valuePropName?: string;
  /** 字段卸载后是否保留值
   *  @default true
   */
  preserve?: boolean;
  /** 是否隐藏字段（保持注册与校验，仅不渲染） */
  hidden?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 无样式模式，不渲染 Form.Item 的标签、布局和错误信息 */
  noStyle?: boolean;
  /**
   * 无 name 时控制函数 children 的更新时机：
   * true = 任意值变化都重新渲染；false = 仅挂载时渲染一次
   */
  shouldUpdate?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素；无 name 且为函数时按 shouldUpdate 联动渲染 */
  children?: React.ReactNode;
}

const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  labelAlign: itemLabelAlign,
  labelWidth,
  colon: itemColon,
  layout: itemLayout,
  tooltip,
  htmlFor: htmlForProp,
  validateFirst,
  rules,
  required,
  dependencies,
  validateTrigger = 'onChange',
  help,
  extra,
  validateStatus,
  messageVariables,
  labelCol: itemLabelCol,
  wrapperCol: itemWrapperCol,
  normalize,
  getValueFromEvent,
  initialValue,
  preserve = true,
  hidden = false,
  disabled: itemDisabled,
  noStyle = false,
  shouldUpdate,
  valuePropName,
  className,
  style,
  children,
}) => {
  const ctx = useFormContext();
  const store = ctx?.store;
  // 字段级订阅：store 任何变更都触发本 Item 重渲染（正确性优先）
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.getSnapshot ?? (() => 0),
    () => 0,
  );
  void snapshot;

  const [validating, setValidating] = useState(false);
  const prevDepsRef = useRef<string>('');

  const triggers = useMemo(
    () =>
      (Array.isArray(validateTrigger)
        ? validateTrigger
        : [validateTrigger]
      ).map((t) => t.toLowerCase()),
    [validateTrigger],
  );

  // 注册字段元信息（含 Item 级 initialValue 播种）；卸载时按 preserve 处理
  useEffect(() => {
    if (!name || !store) return undefined;
    store.registerField(name, {
      rules,
      validateTrigger: Array.isArray(validateTrigger)
        ? validateTrigger.join(',')
        : validateTrigger,
      valuePropName,
      getValueFromEvent,
      normalize,
      initialValue,
      preserve,
      hidden,
      dependencies,
      messageVariables: {
        ...(typeof label === 'string' ? { label } : {}),
        ...(name ? { name } : {}),
        ...messageVariables,
      },
      validateFirst,
      label,
    });
    return () => store.unregisterField(name);
    // meta 全部来自 props，仅在显式变化时重新注册
  }, [
    name,
    store,
    rules,
    validateTrigger,
    valuePropName,
    getValueFromEvent,
    normalize,
    initialValue,
    preserve,
    hidden,
    dependencies,
    messageVariables,
    validateFirst,
    label,
  ]);

  // ---- noStyle 错误冒泡 ----
  // noStyle 字段向最近的「有样式」Item 注册自己；有样式 Item 渲染时
  // 汇总后代字段的错误与警告
  const reportCtx = useContext(ItemReportContext);
  const [descendants, setDescendants] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (noStyle && name && reportCtx) {
      return reportCtx.registerDescendant(name);
    }
    return undefined;
  }, [noStyle, name, reportCtx]);

  const registerDescendant = useCallback((path: string) => {
    setDescendants((prev) => {
      if (prev.has(path)) return prev;
      const next = new Set(prev);
      next.add(path);
      return next;
    });
    return () => {
      setDescendants((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    };
  }, []);

  // Provider value 必须在所有 early return 之前计算（hooks 规则）
  const reportValue = useMemo(
    () => ({ registerDescendant }),
    [registerDescendant],
  );

  const isRequired = required ?? rules?.some((r) => r.required) ?? false;
  const storeErrors = name && store ? store.getFieldError(name) : [];
  const isDisabled = itemDisabled ?? ctx?.disabled ?? false;
  const colon = itemColon ?? ctx?.colon ?? false;
  const labelAlign = itemLabelAlign ?? ctx?.labelAlign ?? 'right';
  const requiredMark = ctx?.requiredMark ?? true;

  const isTouched = name && store ? store.isFieldTouched(name) : false;
  void isTouched;

  // dependencies：依赖字段值变化时重校验自身
  const depsKey = useMemo(() => {
    if (!dependencies || !store) return '';
    return dependencies.map((dep) => String(store.getValue(dep))).join('|');
    // snapshot 作为依赖：store 变更时重新计算
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot 是变更触发器
  }, [dependencies, store, snapshot]);

  useEffect(() => {
    if (!dependencies || !name || !store || prevDepsRef.current === '') {
      prevDepsRef.current = depsKey;
      return;
    }
    if (prevDepsRef.current !== depsKey) {
      prevDepsRef.current = depsKey;
      void store.validateField(name);
    }
  }, [depsKey, dependencies, name, store]);

  /** 从 onChange 参数中取值（默认识别 DOM 事件与裸值） */
  const extractValue = useCallback(
    (args: unknown[]): unknown => {
      if (getValueFromEvent) return getValueFromEvent(...args);
      const e = args[0];
      if (
        e &&
        typeof e === 'object' &&
        'target' in e &&
        (e as { target?: unknown }).target
      ) {
        const target = e.target as HTMLInputElement;
        if (target.type === 'checkbox' || target.type === 'radio') {
          return target.type === 'checkbox' ? target.checked : target.value;
        }
        return target.value;
      }
      return e;
    },
    [getValueFromEvent],
  );

  /** 值变更统一入口：写值 → markTouched → 按触发时机校验 */
  const handleValueChange = useCallback(
    async (rawValue: unknown) => {
      if (!name || !store) return;
      store.markTouched(name);
      store.setFieldValue(name, rawValue);
      if (rules && rules.length > 0 && triggers.includes('onchange')) {
        setValidating(true);
        await store.validateField(name);
        setValidating(false);
      }
    },
    [name, store, rules, triggers],
  );

  // 状态推导：validateStatus 手动指定 > 校验错误 > 后代冒泡 > 警告 > validating
  const fieldWarnings =
    help !== undefined ? [] : name && store ? store.getFieldWarning(name) : [];
  const descendantErrors =
    help === undefined
      ? [...descendants].flatMap((path) => store?.getFieldError(path) ?? [])
      : [];
  const descendantWarnings =
    help === undefined
      ? [...descendants].flatMap((path) => store?.getFieldWarning(path) ?? [])
      : [];
  const fieldErrors =
    help !== undefined ? [] : [...storeErrors, ...descendantErrors];
  const allWarnings = [...fieldWarnings, ...descendantWarnings];
  const status: 'success' | 'warning' | 'error' | 'validating' | undefined =
    validateStatus ??
    (validating
      ? 'validating'
      : fieldErrors.length > 0
        ? 'error'
        : allWarnings.length > 0
          ? 'warning'
          : undefined);

  const effectiveLayout = itemLayout ?? ctx?.layout ?? 'vertical';

  const itemCls = classNames(
    prefixCls('form-item'),
    prefixCls(`form-item-${effectiveLayout}`),
    !hidden && status === 'error' && prefixCls('form-item-error'),
    !hidden && status === 'success' && prefixCls('form-item-success'),
    !hidden && status === 'warning' && prefixCls('form-item-warning'),
    !hidden && status === 'validating' && prefixCls('form-item-validating'),
    isRequired && prefixCls('form-item-required'),
    isDisabled && prefixCls('form-item-disabled'),
    hidden && prefixCls('form-item-hidden'),
    className,
  );

  const labelStyle: React.CSSProperties = {};
  const col = itemLabelCol ?? ctx?.labelCol;
  const wrapper = itemWrapperCol ?? ctx?.wrapperCol;
  if (labelWidth !== undefined && ctx?.layout === 'horizontal') {
    labelStyle.width = labelWidth;
    labelStyle.flexShrink = 0;
  } else if (col?.span !== undefined && ctx?.layout === 'horizontal') {
    labelStyle.width = `${(col.span / 24) * 100}%`;
    labelStyle.flexShrink = 0;
    if (col.offset) {
      labelStyle.marginLeft = `${(col.offset / 24) * 100}%`;
    }
  }
  const controlStyle: React.CSSProperties = {};
  if (wrapper?.offset && ctx?.layout === 'horizontal') {
    controlStyle.marginLeft = `${(wrapper.offset / 24) * 100}%`;
  }

  /** 克隆子元素注入受控 props 与 id */
  const renderChildren = () => {
    if (React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      const childProps = child.props;
      const childType = child.type as
        { displayName?: string; name?: string } | string;
      const displayName =
        typeof childType === 'string'
          ? childType
          : childType?.displayName || childType?.name || '';

      const isSwitchOrCheckbox =
        displayName === 'Switch' ||
        displayName === 'Checkbox' ||
        (typeof childType === 'string' &&
          childType === 'input' &&
          childProps.type === 'checkbox');

      const propName =
        valuePropName ?? (isSwitchOrCheckbox ? 'checked' : 'value');

      const disabledProps = isDisabled ? { disabled: true } : {};
      const sizeProps =
        ctx?.size && childProps.size === undefined ? { size: ctx.size } : {};
      const idProps = name ? { id: name } : {};

      // 无 name：不接管值，仅注入全局配置
      if (!name || !store) {
        return React.cloneElement(child, {
          ...disabledProps,
          ...sizeProps,
        });
      }

      const value = store.getValue(name) ?? (isSwitchOrCheckbox ? false : '');

      const injectOnChange = triggers.includes('onchange');
      const injectOnBlur = triggers.includes('onblur');

      return React.cloneElement(child, {
        ...idProps,
        [propName]: value,
        ...(injectOnChange
          ? {
              onChange: (...args: unknown[]) => {
                void handleValueChange(extractValue(args));
                const childOnChange = childProps.onChange as
                  ((...ev: unknown[]) => void) | undefined;
                childOnChange?.(...args);
              },
            }
          : {}),
        ...(injectOnBlur
          ? {
              onBlur: (...args: unknown[]) => {
                if (name && store) {
                  store.markTouched(name);
                  if (rules && rules.length > 0) void store.validateField(name);
                }
                const childOnBlur = childProps.onBlur as
                  ((...ev: unknown[]) => void) | undefined;
                childOnBlur?.(...args);
              },
            }
          : {}),
        ...disabledProps,
        ...sizeProps,
      });
    }

    return children;
  };

  // 无 name 且 children 为函数：shouldUpdate 联动渲染（antd 模式）
  const prevValuesRef = useRef<Values>({});
  useEffect(() => {
    if (!store) return;
    prevValuesRef.current = store.getFieldsValue();
    // 每次渲染后更新快照（重渲染由 useSyncExternalStore 驱动）
  });

  const frozenChildrenRef = useRef<React.ReactNode>(null);
  const shouldUpdateRender = () => {
    if (!store || typeof children !== 'function') return children;
    // shouldUpdate === false：冻结首帧渲染结果，不跟随值变化
    if (shouldUpdate === false) {
      if (frozenChildrenRef.current === null) {
        frozenChildrenRef.current = (
          children as (prev: Values, next: Values) => React.ReactNode
        )(store.getFieldsValue(), store.getFieldsValue());
      }
      return frozenChildrenRef.current;
    }
    return (children as (prev: Values, next: Values) => React.ReactNode)(
      prevValuesRef.current,
      store.getFieldsValue(),
    );
  };

  const showHelp = help !== undefined ? help : null;
  const showErrors = help === undefined && fieldErrors.length > 0;

  // 无 name：不参与字段逻辑，但仍渲染布局与 label（shouldUpdate 函数 children 或纯注入）
  if (!name) {
    const content =
      typeof children === 'function' ? shouldUpdateRender() : renderChildren();
    if (noStyle) return <>{content}</>;
    return (
      <ItemReportContext.Provider value={reportValue}>
        <div className={itemCls} style={style}>
          {label && (
            <label
              className={classNames(
                prefixCls('form-item-label'),
                labelAlign === 'left' && prefixCls('form-item-label-left'),
              )}
              style={labelStyle}
            >
              {isRequired && (
                <span className={prefixCls('form-item-required-star')}>*</span>
              )}
              {label}
              {tooltip && (
                <span
                  className={prefixCls('form-item-tooltip')}
                  title={typeof tooltip === 'string' ? tooltip : undefined}
                >
                  ?
                </span>
              )}
              {colon && <span className={prefixCls('form-item-colon')}>:</span>}
            </label>
          )}
          <div className={prefixCls('form-item-control')}>
            <div className={prefixCls('form-item-input')}>{content}</div>
            {showErrors || allWarnings.length > 0 ? (
              <div className={prefixCls('form-item-errors')} role="alert">
                {fieldErrors.map((error, index) => (
                  <div
                    key={index}
                    className={prefixCls('form-item-error-text')}
                  >
                    {error}
                  </div>
                ))}
                {allWarnings.map((warning, index) => (
                  <div
                    key={index}
                    className={prefixCls('form-item-warning-text')}
                  >
                    {warning}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </ItemReportContext.Provider>
    );
  }

  // noStyle 模式：只注入 value/onChange/disabled，不渲染外层结构和标签
  if (noStyle) {
    return <>{renderChildren()}</>;
  }

  // 星号语义：requiredMark=false 不显示；'optional' 时非必填项标注「可选」
  const showStar = isRequired && requiredMark !== false;
  const showOptionalMark = requiredMark === 'optional' && !isRequired;

  return (
    <ItemReportContext.Provider value={reportValue}>
      <div
        className={itemCls}
        style={style}
        data-field-name={name}
        hidden={hidden}
      >
        {label && (
          <label
            className={classNames(
              prefixCls('form-item-label'),
              labelAlign === 'left' && prefixCls('form-item-label-left'),
            )}
            htmlFor={htmlForProp ?? name}
            style={labelStyle}
          >
            {showStar && (
              <span className={prefixCls('form-item-required-star')}>*</span>
            )}
            {label}
            {colon && <span className={prefixCls('form-item-colon')}>:</span>}
            {tooltip && (
              <span
                className={prefixCls('form-item-tooltip')}
                title={typeof tooltip === 'string' ? tooltip : undefined}
              >
                ?
              </span>
            )}
            {showOptionalMark && (
              <span className={prefixCls('form-item-optional')}>(可选)</span>
            )}
          </label>
        )}
        <div className={prefixCls('form-item-control')} style={controlStyle}>
          <div className={prefixCls('form-item-input')}>{renderChildren()}</div>
          {showHelp !== null ? (
            <div className={prefixCls('form-item-help')}>{showHelp}</div>
          ) : showErrors || allWarnings.length > 0 ? (
            <div className={prefixCls('form-item-errors')} role="alert">
              {fieldErrors.map((error, index) => (
                <div key={index} className={prefixCls('form-item-error-text')}>
                  {error}
                </div>
              ))}
              {allWarnings.map((warning, index) => (
                <div
                  key={index}
                  className={prefixCls('form-item-warning-text')}
                >
                  {warning}
                </div>
              ))}
            </div>
          ) : null}
          {extra && <div className={prefixCls('form-item-extra')}>{extra}</div>}
        </div>
      </div>
    </ItemReportContext.Provider>
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
  children: (
    fields: FormListFieldData[],
    operations: FormListOperation,
  ) => React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

let listKeyCounter = 0;

const FormList: React.FC<FormListProps> = ({
  name,
  compact,
  children,
  className,
  style,
}) => {
  const ctx = useFormContext();
  const store = ctx?.store;
  // keys 与 values 数组同长度：同步惰性初始化（Form 已在 render 阶段
  // 播种 initialValues，此处一定读得到）
  const [keys, setKeys] = useState<number[]>(() => {
    const val = store?.getValue(name);
    const arr = Array.isArray(val) ? val : [];
    return arr.map(() => ++listKeyCounter);
  });

  const getArray = useCallback((): unknown[] => {
    if (!store) return [];
    const val = store.getValue(name);
    return Array.isArray(val) ? val : [];
  }, [store, name]);

  const setArray = useCallback(
    (next: unknown[]) => {
      store?.setFieldValue(name, next);
    },
    [store, name],
  );

  const add = useCallback(
    (defaultValue?: Record<string, unknown>, insertIndex?: number) => {
      const newKey = ++listKeyCounter;
      setKeys((prev) => {
        const next = [...prev];
        if (insertIndex === undefined || insertIndex >= prev.length) {
          next.push(newKey);
        } else {
          next.splice(Math.max(0, insertIndex), 0, newKey);
        }
        return next;
      });
      if (store) {
        const arr = getArray();
        const next = [...arr];
        const item = defaultValue ?? {};
        if (insertIndex === undefined || insertIndex >= arr.length) {
          next.push(item);
        } else {
          next.splice(Math.max(0, insertIndex), 0, item);
        }
        setArray(next);
      }
    },
    [store, name, getArray, setArray],
  );

  const remove = useCallback(
    (index: number | number[]) => {
      const indices = new Set(Array.isArray(index) ? index : [index]);
      setKeys((prev) => prev.filter((_, i) => !indices.has(i)));
      if (store) {
        setArray(getArray().filter((_, i) => !indices.has(i)));
      }
    },
    [store, name, getArray, setArray],
  );

  const move = useCallback(
    (from: number, to: number) => {
      setKeys((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        if (moved !== undefined) next.splice(to, 0, moved);
        return next;
      });
      if (store) {
        const arr = [...getArray()];
        const [moved] = arr.splice(from, 1);
        if (moved !== undefined) arr.splice(to, 0, moved);
        setArray(arr);
      }
    },
    [store, name, getArray, setArray],
  );

  const fields: FormListFieldData[] = keys.map((key, index) => ({
    key,
    name: index,
  }));

  const listCls = classNames(
    prefixCls('form-list'),
    compact && prefixCls('form-list-compact'),
    className,
  );

  return (
    <div className={listCls} style={style}>
      {children(fields, { add, remove, move })}
    </div>
  );
};

FormList.displayName = 'Form.List';

/* ===== Form.ErrorList ===== */

export interface ErrorListProps {
  /** 错误信息列表 */
  errors?: string[];
  /** 警告信息列表 */
  warnings?: string[];
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 错误列表：常配合 noStyle / 自定义控件展示一组字段错误（antd 同名能力） */
const ErrorList: React.FC<ErrorListProps> = ({
  errors = [],
  warnings = [],
  className,
  style,
}) => (
  <div
    className={classNames(prefixCls('form-errorlist'), className)}
    style={style}
    role="alert"
  >
    {errors.map((error, index) => (
      <div key={index} className={prefixCls('form-item-error-text')}>
        {error}
      </div>
    ))}
    {warnings.map((warning, index) => (
      <div key={index} className={prefixCls('form-item-warning-text')}>
        {warning}
      </div>
    ))}
  </div>
);

ErrorList.displayName = 'Form.ErrorList';

/* ===== Form.Provider ===== */

export interface FormProviderProps {
  /**
   * 任意有 name 的 Form 提交成功后触发（多表单协调）：
   * info.forms 为 Provider 下按 name 注册的全部实例
   */
  onFormFinish?: (
    name: string,
    info: { values: Values; forms: Record<string, FormInstance> },
  ) => void;
  children?: React.ReactNode;
}

export interface FormProviderContextValue {
  registerForm: (name: string, form: FormInstance) => () => void;
  notifyFormFinish: (name: string, values: Values) => void;
}

const FormProviderContext = createContext<FormProviderContextValue | null>(
  null,
);

const FormProvider: React.FC<FormProviderProps> = ({
  onFormFinish,
  children,
}) => {
  const formsRef = useRef<Map<string, FormInstance>>(new Map());
  const onFormFinishRef = useRef(onFormFinish);
  onFormFinishRef.current = onFormFinish;

  const value = useMemo<FormProviderContextValue>(
    () => ({
      registerForm: (name, form) => {
        formsRef.current.set(name, form);
        return () => formsRef.current.delete(name);
      },
      notifyFormFinish: (name, values) => {
        if (!onFormFinishRef.current) return;
        const forms: Record<string, FormInstance> = {};
        formsRef.current.forEach((instance, key) => {
          forms[key] = instance;
        });
        onFormFinishRef.current(name, { values, forms });
      },
    }),
    [],
  );

  return (
    <FormProviderContext.Provider value={value}>
      {children}
    </FormProviderContext.Provider>
  );
};

FormProvider.displayName = 'Form.Provider';

/* ===== Form 主组件 ===== */

export interface FormProps {
  /** 布局方式
   *  @default 'vertical'
   */
  layout?: Layout;
  /** 初始值 */
  initialValues?: Values;
  /** 提交成功回调 */
  onFinish?: (values: Values) => void;
  /** 提交失败回调 */
  onFinishFailed?: (errors: FormError[]) => void;
  /** 任意字段值变化回调（联动与持久化的钩子） */
  onValuesChange?: (
    changed: { name: string; value: unknown },
    allValues: Values,
  ) => void;
  /** 提交失败时是否滚动到第一个错误字段
   *  @default false
   */
  scrollToFirstError?: boolean;
  /** 必填标记：true 显示星号（默认）；false 不显示；'optional' 在非必填项标注「可选」
   *  @default true
   */
  requiredMark?: RequiredMark;
  /** 标签栅格（horizontal 模式，共 24 栏） */
  labelCol?: ColConfig;
  /** 控件区栅格（horizontal 模式） */
  wrapperCol?: ColConfig;
  /** 标签对齐方式
   *  @default 'right'
   */
  labelAlign?: 'left' | 'right';
  /** 是否在标签后显示冒号。缺省时按布局推导：horizontal / inline 为 true，vertical 为 false */
  colon?: boolean;
  /** 是否禁用所有表单项 */
  disabled?: boolean;
  /** 表单尺寸
   *  @default 'md'
   */
  size?: Size;
  /** 命令式实例（由 `Form.useForm()` 创建），用于编辑回填、外部提交等场景 */
  form?: FormInstance;
  /** 表单名称（配合 Form.Provider 的 onFormFinish 做多表单协调） */
  name?: string;
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
      layout = 'horizontal',
      initialValues = {},
      onFinish,
      onFinishFailed,
      onValuesChange,
      scrollToFirstError = false,
      requiredMark = true,
      labelCol,
      wrapperCol,
      labelAlign = 'right',
      colon: colonProp,
      disabled = false,
      size = 'md',
      form,
      name: formName,
      className,
      style,
      children,
    },
    ref,
  ) => {
    // 有 form prop 用外部实例；否则内部自建（惰性，避免每次渲染新建）
    const internalInstanceRef = useRef<FormInstance | null>(null);
    if (!form && !internalInstanceRef.current) {
      internalInstanceRef.current = createFormInstance();
    }
    const instance = form ?? internalInstanceRef.current!;
    const store =
      instanceStore.get(instance) ??
      (() => {
        // form 实例在组件外创建但尚未挂 Form 时的兜底（不应发生）
        const s = new FormStore();
        instanceStore.set(instance, s);
        return s;
      })();

    // initialValues 同步播种（render 阶段，早于所有子组件渲染——
    // List 等子组件在 render/effect 里都要能读到初始值）。
    // 版本号为 0 表示尚未发生任何变更，保证只播种一次。
    if (store.getSnapshot() === 0 && Object.keys(initialValues).length > 0) {
      store.setInitialValues(initialValues);
      store.setFieldsValue(initialValues, { silent: true });
    }

    // 引擎快照：任何值/错误变更都会驱动 Form 子树重渲染
    useSyncExternalStore(store.subscribe, store.getSnapshot, () => 0);

    // 回调经 ref 透传，handleSubmit 始终调用最新版本
    const onFinishRef = useRef(onFinish);
    const onFinishFailedRef = useRef(onFinishFailed);
    onFinishRef.current = onFinish;
    onFinishFailedRef.current = onFinishFailed;

    // 引擎只挂 onValuesChange（提交回调由 handleSubmit 显式调用）
    useEffect(() => {
      store.setOptions({ onValuesChange });
    }, [store, onValuesChange]);

    useEffect(() => {
      store.setInitialValues(initialValues);
      // initialValues 首次播种（后续变更不再覆盖用户输入，与 antd 一致）
      if (Object.keys(initialValues).length > 0) {
        const current = store.getFieldsValue();
        if (Object.keys(current).length === 0) {
          store.setFieldsValue(initialValues);
        }
      }
      // 仅挂载时播种
      // eslint-disable-next-line react-hooks/exhaustive-deps -- 见上
    }, [store]);

    // Provider 注册：有 name 时把自己挂到最近的 Form.Provider
    const providerCtx = useContext(FormProviderContext);
    useEffect(() => {
      if (!formName || !providerCtx) return undefined;
      const selfInstance = instance ?? createFormInstance(store);
      return providerCtx.registerForm(formName, selfInstance);
      // instance 变化时重新注册
    }, [formName, providerCtx, instance, store]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const values = await store.validateFields();
          onFinishRef.current?.(values);
          // 多表单协调：Provider 的 onFormFinish
          providerCtx?.notifyFormFinish(formName ?? '', values);
        } catch (errors) {
          onFinishFailedRef.current?.(errors as FormError[]);
          if (scrollToFirstError) {
            requestAnimationFrame(() => {
              document
                .querySelector(`.${prefixCls('form-item-error')}`)
                ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
            });
          }
        }
      },
      [store, scrollToFirstError, providerCtx, formName],
    );

    // colon 缺省按布局推导：horizontal / inline 为 true，vertical 为 false
    const derivedColon = colonProp ?? (layout === 'vertical' ? false : true);

    const ctxValue: FormContextValue = useMemo(
      () => ({
        store,
        instance,
        labelCol,
        wrapperCol,
        layout,
        disabled,
        colon: derivedColon,
        size,
        labelAlign,
        requiredMark,
      }),
      [
        store,
        instance,
        labelCol,
        wrapperCol,
        layout,
        disabled,
        derivedColon,
        size,
        labelAlign,
        requiredMark,
      ],
    );

    const formCls = classNames(
      prefixCls('form'),
      prefixCls(`form-${layout}`),
      prefixCls(`form-${size}`),
      className,
    );

    return (
      <FormContext.Provider value={ctxValue}>
        <form
          ref={ref}
          className={formCls}
          style={style}
          onSubmit={handleSubmit}
          noValidate
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  },
);

FormBase.displayName = 'Form';

/* ===== 复合组件 ===== */

interface FormComponent extends React.ForwardRefExoticComponent<
  FormProps & React.RefAttributes<HTMLFormElement>
> {
  Item: typeof FormItem;
  List: typeof FormList;
  /** 创建 FormInstance（与 antd 用法一致：`const [form] = Form.useForm()`） */
  useForm: () => [FormInstance];
  /** 订阅字段值（联动渲染） */
  useWatch: typeof useWatch;
  /** 获取最近 Form 的命令式实例 */
  useFormInstance: typeof useFormInstance;
  /** 多表单协调容器 */
  Provider: typeof FormProvider;
  /** 字段错误列表（noStyle 场景） */
  ErrorList: typeof ErrorList;
}

const Form = FormBase as unknown as FormComponent;
Form.Item = FormItem;
Form.List = FormList;
Form.useForm = () => useForm();
Form.useWatch = useWatch;
Form.useFormInstance = useFormInstance;
Form.Provider = FormProvider;
Form.ErrorList = ErrorList;

export {
  Form,
  FormItem,
  FormList,
  useWatch,
  useFormInstance,
  FormProvider,
  ErrorList,
};
export default Form;
