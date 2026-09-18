import React, { useMemo } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { Locale } from 'antd/es/locale';
import type { ThemeConfig } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { antdTokenOverrides } from '@aura/shared';
import { deriveAccentVars } from '../utils/color';

export interface XProviderProps {
  children: React.ReactNode;
  /** 暗色模式：切换 antd 暗色算法，并在子树作用域启用暗色令牌（data-theme="dark"） */
  dark?: boolean;
  /** 是否启用紧凑模式 */
  compact?: boolean;
  /**
   * 主题主色。组件视觉（渐变 / 光晕 / 软底）由它**实时派生**：
   * 换主色，所有 --aura-x-* 品牌变量即时跟随。
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
 *
 * 主题派生：`colorPrimary` 会实时派生整套 `--aura-x-*` 品牌变量（渐变 / 光晕 /
 * 软底 / 边框），注入到子树作用域——Bubble / Sender / MarkdownContent 等
 * 组件消费这些变量，因此**换主色即时全量生效**；`dark` 同时在子树启用
 * `data-theme="dark"` 暗色令牌。
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

  // 由主色派生品牌相关变量（accent / 渐变 / 光晕 / 软底 / 边框），
  // 注入到子树作用域——组件消费同名变量，换主色即时全量生效
  const accentVars = useMemo(
    () => (colorPrimary ? deriveAccentVars(colorPrimary) : undefined),
    [colorPrimary],
  );

  return (
    <ConfigProvider theme={themeConfig} locale={locale}>
      <div
        style={accentVars as React.CSSProperties | undefined}
        data-theme={dark ? 'dark' : undefined}
      >
        {children}
      </div>
    </ConfigProvider>
  );
};

XProvider.displayName = 'XProvider';
