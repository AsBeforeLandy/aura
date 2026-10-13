/**
 * 全局动效配置 —— 统一从本包出口取用，业务代码不直接依赖 `motion/react`。
 * 这样引擎被替换时，业务代码的 import 路径不变。
 */
export { MotionConfig } from 'motion/react';
