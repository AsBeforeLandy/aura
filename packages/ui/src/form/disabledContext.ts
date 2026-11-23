import { createContext } from 'react';

/**
 * Form 的 disabled 级联上下文：Form 设置 disabled 后，
 * 包裹在 Form 内的 Button 等组件自动禁用（对齐 antd）。
 * 独立成文件以避免 button → form 的模块循环依赖。
 */
export const FormDisabledContext = createContext<boolean | undefined>(
  undefined,
);
