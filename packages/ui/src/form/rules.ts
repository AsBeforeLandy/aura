/**
 * 校验规则类型定义（对齐 antd Form 的常用 Rule 子集）。
 */

export interface RuleType {
  /** 必填（undefined / null / '' / 空数组视为空） */
  required?: boolean;
  /** 错误提示文案 */
  message?: string;
  /** 最小值（number 类型按数值比较，string/Array 按长度） */
  min?: number;
  /** 最大值（同上） */
  max?: number;
  /** 正则校验 */
  pattern?: RegExp;
  /** 内置格式：email / url / number / integer */
  type?: 'email' | 'url' | 'number' | 'integer';
  /** 空白字符串也视为空（配合 required，如密码框） */
  whitespace?: boolean;
  /**
   * 自定义校验器，两种签名均支持：
   * - `(value) => boolean | Promise<boolean>`
   * - `(rule, value) => Promise<void | Error>`（antd 风格）
   */
  validator?:
    | ((value: unknown) => boolean | Promise<boolean>)
    | ((rule: RuleType, value: unknown) => Promise<void | Error>);
}
