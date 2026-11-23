/**
 * FormStore —— Form 的统一表单引擎（rc-field-form 风格的精简实现）。
 *
 * 值 / 错误 / touched / 字段元信息全部收敛在这里，组件层只消费 store：
 * - 值支持嵌套点路径（'user.name'）
 * - 字段注册携带完整元信息（rules / validateTrigger / normalize 等）
 * - 订阅基于版本号：任何变更 +1，Item 通过 useSyncExternalStore 精确跟随
 * - 校验器手写覆盖 antd 常用规则（不加 async-validator 依赖）
 */

import type { RuleType } from './rules';

export interface FieldMeta {
  rules?: RuleType[];
  validateTrigger?: string;
  valuePropName?: string;
  getValueFromEvent?: (...args: unknown[]) => unknown;
  normalize?: (
    value: unknown,
    prevValue: unknown,
    allValues: Record<string, unknown>,
  ) => unknown;
  initialValue?: unknown;
  preserve?: boolean;
  hidden?: boolean;
  /** 触发自身重校验的依赖字段路径 */
  dependencies?: string[];
}

export interface FormError {
  name: string;
  errors: string[];
}

export type Values = Record<string, unknown>;

/* ===== 嵌套路径工具 ===== */

export function getNestedValue(obj: Values, path: string): unknown {
  if (!path.includes('.')) return obj[path];
  let cur: unknown = obj;
  for (const key of path.split('.')) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Values)[key];
  }
  return cur;
}

/** 不可变写入：路径上每层浅拷贝；数组节点保持数组类型 */
export function setNestedValue(
  obj: Values,
  path: string,
  value: unknown,
): Values {
  if (!path.includes('.')) return { ...obj, [path]: value };
  const keys = path.split('.');
  const clone = (node: Values, depth: number): Values => {
    const key = keys[depth];
    if (depth === keys.length - 1) {
      if (Array.isArray(node)) {
        const next = [...(node as unknown[])] as unknown as Values;
        next[key as unknown as string] = value;
        return next;
      }
      return { ...node, [key]: value };
    }
    const child = (node as Record<string, unknown>)[key];
    if (Array.isArray(child)) {
      const clonedChild = clone(child as unknown as Values, depth + 1);
      return {
        ...(node as Values),
        [key]: clonedChild as unknown as unknown[],
      };
    }
    return {
      ...(node as Values),
      [key]: clone((child as Values) ?? {}, depth + 1),
    };
  };
  return clone(obj, 0);
}

/** 不可变删除 */
function deleteNestedValue(obj: Values, path: string): Values {
  if (!path.includes('.')) {
    const next = { ...obj };
    delete next[path];
    return next;
  }
  const keys = path.split('.');
  const clone = (node: Values, depth: number): Values => {
    const key = keys[depth];
    if (depth === keys.length - 1) {
      const next = { ...node };
      delete next[key];
      return next;
    }
    const child = node[key] as Values | undefined;
    return child ? { ...node, [key]: clone(child, depth + 1) } : { ...node };
  };
  return clone(obj, 0);
}

/* ===== Store ===== */

export interface StoreOptions {
  onValuesChange?: (
    changed: { name: string; value: unknown },
    allValues: Values,
  ) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errors: FormError[]) => void;
}

export class FormStore {
  private values: Values = {};
  private errors: Record<string, string[]> = {};
  private touchedSet = new Set<string>();
  private fields = new Map<string, FieldMeta>();
  private listeners = new Set<() => void>();
  private version = 0;
  private submitting = false;

  private initialValues: Values = {};
  private opts: StoreOptions = {};

  /* --- 订阅 --- */

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** useSyncExternalStore 的快照：返回版本号 */
  getSnapshot = (): number => this.version;

  private notify() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }

  /* --- 读取 --- */

  getValue(path: string): unknown {
    return getNestedValue(this.values, path);
  }

  getFieldsValue(): Values {
    return deepClone(this.values);
  }

  getFieldError(path: string): string[] {
    return this.errors[path] ?? [];
  }

  getFieldsError(): Record<string, string[]> {
    return { ...this.errors };
  }

  isFieldTouched(path: string): boolean {
    return this.touchedSet.has(path);
  }

  isFieldsTouched(paths?: string[]): boolean {
    const targets = paths ?? [...this.touchedSet];
    if (targets.length === 0) return false;
    return paths ? paths.some((p) => this.touchedSet.has(p)) : true;
  }

  isFieldsValidating(): boolean {
    return this.submitting;
  }

  hasFeedback(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /* --- 写入 --- */

  setFieldValue(
    path: string,
    value: unknown,
    options?: { silent?: boolean },
  ): void {
    const meta = this.fields.get(path);
    let next = value;
    if (meta?.normalize && !options?.silent) {
      next = meta.normalize(value, this.getValue(path), this.getFieldsValue());
    }
    const prev = this.getValue(path);
    if (Object.is(prev, next)) return;
    this.values = setNestedValue(this.values, path, next);
    if (!options?.silent) {
      this.opts.onValuesChange?.(
        { name: path, value: next },
        this.getFieldsValue(),
      );
    }
    this.notify();
  }

  setFieldsValue(partial: Values, options?: { silent?: boolean }): void {
    let merged = this.values;
    for (const [path, value] of Object.entries(partial)) {
      const meta = this.fields.get(path);
      merged = setNestedValue(
        merged,
        path,
        meta?.normalize
          ? meta.normalize(value, getNestedValue(this.values, path), merged)
          : value,
      );
    }
    this.values = merged;
    if (!options?.silent) {
      this.opts.onValuesChange?.(
        {
          name: Object.keys(partial)[0] ?? '',
          value: getNestedValue(this.values, Object.keys(partial)[0] ?? ''),
        },
        this.getFieldsValue(),
      );
      this.notify();
    }
  }

  /** 直接覆盖错误（setFields 实例方法） */
  setFields(
    updates: Record<
      string,
      { errors?: string[] | null; touched?: boolean; value?: unknown }
    >,
  ): void {
    for (const [path, update] of Object.entries(updates)) {
      if (update.value !== undefined) {
        this.values = setNestedValue(this.values, path, update.value);
      }
      if (update.errors !== undefined) {
        if (update.errors === null) delete this.errors[path];
        else this.errors[path] = update.errors;
      }
      if (update.touched !== undefined) {
        if (update.touched) this.touchedSet.add(path);
        else this.touchedSet.delete(path);
      }
    }
    this.notify();
  }

  /* --- 字段注册 --- */

  registerField(path: string, meta: FieldMeta): void {
    this.fields.set(path, meta);
    // Item 级 initialValue：store 尚无值且从未交互时写入
    if (meta.initialValue !== undefined && this.getValue(path) === undefined) {
      this.values = setNestedValue(this.values, path, meta.initialValue);
      this.notify();
    }
  }

  unregisterField(path: string): void {
    const meta = this.fields.get(path);
    this.fields.delete(path);
    // preserve=false：字段卸载后丢弃值
    if (meta && meta.preserve === false) {
      this.values = deleteNestedValue(this.values, path);
      delete this.errors[path];
      this.touchedSet.delete(path);
      this.notify();
    }
  }

  markTouched(path: string): void {
    this.touchedSet.add(path);
  }

  setSubmitting(v: boolean): void {
    this.submitting = v;
  }

  /* --- 校验 --- */

  async validateField(path: string): Promise<string[]> {
    const meta = this.fields.get(path);
    const rules = meta?.rules ?? [];
    if (rules.length === 0) {
      if (this.errors[path]) {
        delete this.errors[path];
        this.notify();
      }
      return [];
    }
    const fieldErrors = await validateRules(rules, this.getValue(path));
    const prev = this.errors[path];
    if (fieldErrors.length > 0) this.errors[path] = fieldErrors;
    else delete this.errors[path];
    // 单字段校验同样要通知（onChange/onBlur 实时校验的错误需要渲染）
    if (JSON.stringify(prev) !== JSON.stringify(fieldErrors)) {
      this.notify();
    }
    return fieldErrors;
  }

  async validateFields(paths?: string[]): Promise<Values> {
    const targets = paths ?? [...this.fields.keys()];
    const allErrors: FormError[] = [];
    const nextErrors: Record<string, string[]> = {};

    for (const path of targets) {
      const fieldErrors = await this.validateField(path);
      if (fieldErrors.length > 0) {
        nextErrors[path] = fieldErrors;
        allErrors.push({ name: path, errors: fieldErrors });
      }
    }

    // 替换式更新：本次校验通过的字段清除旧错误
    for (const path of targets) {
      if (nextErrors[path]) this.errors[path] = nextErrors[path];
      else delete this.errors[path];
    }
    this.notify();

    if (allErrors.length > 0) {
      throw allErrors;
    }
    return this.getFieldsValue();
  }

  /* --- 提交 / 重置 --- */

  async submit(): Promise<void> {
    try {
      this.setSubmitting(true);
      const values = await this.validateFields();
      this.opts.onFinish?.(values);
    } catch (errors) {
      this.opts.onFinishFailed?.(errors as FormError[]);
    } finally {
      this.setSubmitting(false);
      this.notify();
    }
  }

  resetFields(): void {
    this.values = deepClone(this.initialValues);
    this.errors = {};
    this.touchedSet.clear();
    this.notify();
  }

  /* --- 配置 --- */

  setOptions(opts: Partial<StoreOptions>): void {
    this.opts = { ...this.opts, ...opts };
  }

  setInitialValues(initialValues: Values): void {
    this.initialValues = deepClone(initialValues ?? {});
  }
}

function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value))
    return value.map((item) => deepClone(item)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = deepClone(val);
  }
  return out as T;
}

/* ===== 校验器 ===== */

const BUILTIN_PATTERNS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/[^\s$.?#].[^\s]*$/i,
  number: /^-?\d+(\.\d+)?$/,
  integer: /^-?\d+$/,
};

/** 单条规则校验；返回错误消息，通过返回 null */
async function validateSingleRule(
  rule: RuleType,
  value: unknown,
): Promise<string | null> {
  const label = rule.message;

  // 自定义校验器：兼容两种签名（value) / (rule, value)，返回 bool / void / throw
  if (rule.validator) {
    try {
      const result =
        rule.validator.length >= 2
          ? await (rule.validator as (r: RuleType, v: unknown) => unknown)(
              rule,
              value,
            )
          : await rule.validator(value);
      if (result === false || result instanceof Error) {
        return result instanceof Error ? result.message : (label ?? '验证失败');
      }
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : (label ?? '验证失败');
    }
  }

  // required：undefined / null / 空串 / 空数组 视为空；whitespace 时空白串也算空
  const isBlank =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (rule.whitespace && typeof value === 'string' && value.trim() === '');
  if (rule.required && isBlank) {
    return label ?? '此字段为必填项';
  }

  // 空值跳过后续规则（required 已处理空值报错）
  if (isBlank) return null;

  // min / max：数字用数值比较，字符串/数组用长度
  if (rule.min !== undefined || rule.max !== undefined) {
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return label ?? `最小值应为 ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return label ?? `最大值应为 ${rule.max}`;
      }
    } else if (typeof value === 'string' || Array.isArray(value)) {
      const length = value.length;
      if (rule.min !== undefined && length < rule.min) {
        return label ?? `最少输入 ${rule.min} 个字符`;
      }
      if (rule.max !== undefined && length > rule.max) {
        return label ?? `最多输入 ${rule.max} 个字符`;
      }
    }
  }

  // 内置类型校验
  if (rule.type && BUILTIN_PATTERNS[rule.type]) {
    if (!BUILTIN_PATTERNS[rule.type].test(String(value))) {
      return label ?? `格式不正确（${rule.type}）`;
    }
  }

  // 正则
  if (rule.pattern && !rule.pattern.test(String(value))) {
    return label ?? '格式不正确';
  }

  return null;
}

export async function validateRules(
  rules: RuleType[],
  value: unknown,
): Promise<string[]> {
  const errors: string[] = [];
  for (const rule of rules) {
    const error = await validateSingleRule(rule, value);
    if (error) errors.push(error);
  }
  return errors;
}
