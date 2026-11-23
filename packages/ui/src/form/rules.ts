/**
 * 校验规则类型定义（对齐 antd Form / async-validator 的常用规则子集）。
 */

export interface RuleType {
  /** 必填（undefined / null / '' / 空数组视为空） */
  required?: boolean;
  /**
   * 错误提示文案，支持两种形态：
   * - 字符串，可含 `{{label}}` 等 messageVariables 占位符
   * - 函数 `(rule) => string`（动态文案）
   */
  message?: string | ((rule: RuleType) => string);
  /** 最小值（number 按数值比较，string/Array 按长度） */
  min?: number;
  /** 最大值（同上） */
  max?: number;
  /** 精确长度（string/Array）或精确数值（number） */
  len?: number;
  /** 正则校验 */
  pattern?: RegExp;
  /** 内置格式：object（配合 fields）/ string（默认，任意非空）/ email / url / number / integer / boolean / array / date */
  type?:
    | 'object'
    | 'string'
    | 'email'
    | 'url'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'date';
  /**
   * 对象子字段 schema（配合 type='object'）：对 value 的每个子字段
   * 应用各自规则。子字段错误会写入嵌套路径（如 `address.city`），
   * 嵌套的 noStyle Form.Item 可直接消费展示。
   */
  fields?: Record<string, RuleType>;
  /** 值必须在此列表内 */
  enum?: unknown[];
  /** 空白字符串也视为空（配合 required，如密码框） */
  whitespace?: boolean;
  /** 校验前转换值（转换结果用于校验，不影响表单值） */
  transform?: (value: unknown) => unknown;
  /** 仅警告：校验失败不阻止提交，错误以警告样式展示 */
  warningOnly?: boolean;
  /** 数组字段的元素级规则（对 value 的每个元素应用） */
  defaultField?: RuleType;
  /**
   * 自定义校验器，两种签名均支持：
   * - `(value) => boolean | Promise<boolean>`
   * - `(rule, value) => Promise<void | Error>`（antd 风格）
   */
  validator?:
    | ((value: unknown) => boolean | Promise<boolean>)
    | ((rule: RuleType, value: unknown) => Promise<void | Error>);
}

/** 解析 message：函数形态传入 rule 动态生成 */
export function resolveMessage(rule: RuleType, fallback: string): string {
  if (typeof rule.message === 'function') return rule.message(rule);
  return rule.message ?? fallback;
}
