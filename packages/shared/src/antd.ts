// Aura 令牌 → antd token 的映射（纯数据，本文件不 import antd）
//
// BusinessProvider（@aura-react-comp/business）与 XProvider（@aura-react-comp/x）都需要把 Aura 的
// 设计令牌映射成 antd 的 token 覆盖集。把这张映射表收敛在这里作为单一数据源，
// 各 Provider 只需自行组装 algorithm（1 行），不再各自维护一份映射。

import { auraTokens } from './tokens';

export interface AuraSemanticColors {
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

export interface AuraAntdTokenOverrides {
  colorPrimary: string;
  colorLink: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  borderRadius: number;
  borderRadiusLG: number;
  borderRadiusSM: number;
  fontSize: number;
  controlHeight: number;
}

/** 运行时可用的语义色全集（读取失败时逐项回退静态令牌） */
export interface RuntimeAuraColors {
  colorPrimary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * 从 <html> 的当前生效值读取 Aura 颜色令牌。
 *
 * 双轴主题（data-mode × data-palette）切换的是 CSS 变量的值，
 * antd 的 ConfigProvider token 却是 JS 侧的一次性快照 —— 这里提供桥接：
 * Provider 在主题变化后调用本函数即可拿到当前色板的实际颜色。
 * SSR / 未引入 tokens.css 时回退静态 auraTokens（紫罗兰）。
 */
export function readRuntimeAuraColors(): RuntimeAuraColors {
  const fallback: RuntimeAuraColors = {
    colorPrimary: auraTokens.colors.primary[700],
    success: auraTokens.colors.success,
    warning: auraTokens.colors.warning,
    error: auraTokens.colors.error,
    info: auraTokens.colors.info,
  };
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }
  const styles = window.getComputedStyle(document.documentElement);
  const read = (name: string, fallbackColor: string) =>
    styles.getPropertyValue(name).trim() || fallbackColor;
  return {
    colorPrimary: read('--aura-primary-700', fallback.colorPrimary),
    success: read('--aura-success', fallback.success),
    warning: read('--aura-warning', fallback.warning),
    error: read('--aura-error', fallback.error),
    info: read('--aura-info', fallback.info),
  };
}

/**
 * 生成 antd token 覆盖集。
 *
 * @param colorPrimary 覆盖主题主色；缺省使用 Aura 主色 primary-700（#7c3aed）。
 *   主色同时用于 colorLink —— antd 的 colorLink 默认派生自 colorInfo（见
 *   genColorMapToken），若 colorInfo 为语义蓝，链接型元素（Button type="link"、
 *   a 标签等）会呈现蓝色而与品牌主色脱节，故显式让链接色跟随主色。
 * @param semantic 覆盖语义色（success/warning/error/info）；缺省用静态
 *   auraTokens。双轴主题下 Sunset 色板会调深 warning/error，Provider 应把
 *   运行时读取的值传进来以保持一致。
 */
export function antdTokenOverrides(
  colorPrimary?: string,
  semantic?: AuraSemanticColors,
): AuraAntdTokenOverrides {
  const primary = colorPrimary || auraTokens.colors.primary[700];

  return {
    colorPrimary: primary,
    colorLink: primary,
    colorSuccess: semantic?.success || auraTokens.colors.success,
    colorWarning: semantic?.warning || auraTokens.colors.warning,
    colorError: semantic?.error || auraTokens.colors.error,
    colorInfo: semantic?.info || auraTokens.colors.info,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    fontSize: 14,
    controlHeight: 34,
  };
}
