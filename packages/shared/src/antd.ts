// Aura 令牌 → antd token 的映射（纯数据，本文件不 import antd）
//
// BusinessProvider（@aura/business）与 XProvider（@aura/x）都需要把 Aura 的
// 设计令牌映射成 antd 的 token 覆盖集。把这张映射表收敛在这里作为单一数据源，
// 各 Provider 只需自行组装 algorithm（1 行），不再各自维护一份映射。

import { auraTokens } from './tokens';

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

/**
 * 生成 antd token 覆盖集。
 *
 * @param colorPrimary 覆盖主题主色；缺省使用 Aura 主色 primary-700（#7c3aed）。
 *   主色同时用于 colorLink —— antd 的 colorLink 默认派生自 colorInfo（见
 *   genColorMapToken），若 colorInfo 为语义蓝，链接型元素（Button type="link"、
 *   a 标签等）会呈现蓝色而与品牌主色脱节，故显式让链接色跟随主色。
 */
export function antdTokenOverrides(colorPrimary?: string): AuraAntdTokenOverrides {
  const primary = colorPrimary || auraTokens.colors.primary[700];

  return {
    colorPrimary: primary,
    colorLink: primary,
    colorSuccess: auraTokens.colors.success,
    colorWarning: auraTokens.colors.warning,
    colorError: auraTokens.colors.error,
    colorInfo: auraTokens.colors.info,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    fontSize: 14,
    controlHeight: 34,
  };
}
