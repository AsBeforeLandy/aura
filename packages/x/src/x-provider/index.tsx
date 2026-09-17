import React, { useMemo } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { Locale } from 'antd/es/locale';
import type { ThemeConfig } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { antdTokenOverrides } from '@aura/shared';

export interface XProviderProps {
  children: React.ReactNode;
  /** 暗色模式：切换 antd 暗色算法 */
  dark?: boolean;
  /** 是否启用紧凑模式 */
  compact?: boolean;
  /**
   * 主题主色
   * @default auraTokens.colors.primary[700] (#7c3aed)
   */
  colorPrimary?: string;
  /**
   * 语言包
   * @default zhCN
   */
  locale?: Locale;
}

export interface XThemeConfigOptions {
  dark?: boolean;
  compact?: boolean;
  colorPrimary?: string;
}

/**
 * 组装 XProvider 的 antd 主题配置。
 *
 * 令牌覆盖集来自 @aura/shared 的单一数据源（与 BusinessProvider 共用）；
 * 这里只负责 algorithm 的组装：暗色 / 默认 + 可选紧凑。
 * 导出以便单测直接断言配置内容。
 */
export function buildXThemeConfig({ dark = false, compact = false, colorPrimary }: XThemeConfigOptions): ThemeConfig {
  const algorithms = [dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm];
  if (compact) algorithms.push(antdTheme.compactAlgorithm);

  return {
    algorithm: algorithms,
    token: antdTokenOverrides(colorPrimary),
  };
}

/**
 * XProvider — AI 组件主题桥接
 *
 * 将 Aura 设计令牌映射到 antd 的主题系统，为 AI 对话组件（Bubble / Sender 等）
 * 提供与 @aura/ui、@aura/business 一致的紫罗兰视觉语言。
 *
 * antd v6 默认使用 CSS Variables，因此可与 Aura 的 CSS 变量主题体系共存。
 */
export const XProvider: React.FC<XProviderProps> = ({
  children,
  dark = false,
  compact = false,
  colorPrimary,
  locale = zhCN,
}) => {
  const themeConfig = useMemo(
    () => buildXThemeConfig({ dark, compact, colorPrimary }),
    [dark, compact, colorPrimary],
  );

  return (
    <ConfigProvider theme={themeConfig} locale={locale}>
      {children}
    </ConfigProvider>
  );
};

XProvider.displayName = 'XProvider';
