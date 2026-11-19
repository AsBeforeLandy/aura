import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { Locale } from 'antd/es/locale';
import type { ThemeConfig } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  antdTokenOverrides,
  readRuntimeAuraColors,
  type RuntimeAuraColors,
} from '@aura-react-comp/shared';
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
   * @default 运行时读取 --aura-primary-700（随全局双轴主题联动）；
   *   此时品牌变量沿用 tokens.css 的全局值，不重复注入
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
  /** 语义色覆盖（缺省用静态 auraTokens）；Provider 运行时传入当前色板值 */
  semantic?: {
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
}

/**
 * 组装 XProvider 的 antd 主题配置。
 *
 * 令牌覆盖集来自 @aura-react-comp/shared 的单一数据源（与 BusinessProvider 共用）；
 * 这里只负责 algorithm 的组装：暗色 / 默认 + 可选紧凑。
 * 导出以便单测直接断言配置内容。
 */
export function buildXThemeConfig({
  dark = false,
  compact = false,
  colorPrimary,
  semantic,
}: XThemeConfigOptions): ThemeConfig {
  const algorithms = [
    dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  ];
  if (compact) algorithms.push(antdTheme.compactAlgorithm);

  return {
    algorithm: algorithms,
    token: antdTokenOverrides(colorPrimary, semantic),
  };
}

/**
 * 订阅 <html> 的双轴主题属性（data-mode / data-palette / data-theme），
 * 任一变化即重读当前生效的 Aura 颜色令牌。
 * 与 charts 包 useChartTheme 的订阅策略一致。
 */
function useRuntimeThemeColors(): RuntimeAuraColors {
  const [colors, setColors] = useState<RuntimeAuraColors>(
    readRuntimeAuraColors,
  );

  useEffect(() => {
    const update = () => setColors(readRuntimeAuraColors());
    update();

    if (
      typeof MutationObserver === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return undefined;
    }
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode', 'data-palette', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}

/**
 * XProvider — AI 组件主题桥接
 *
 * 将 Aura 设计令牌映射到 antd 的主题系统，为 AI 对话组件（Bubble / Sender 等）
 * 提供与 @aura-react-comp/ui、@aura-react-comp/business 一致的视觉语言。
 *
 * antd v6 默认使用 CSS Variables，因此可与 Aura 的 CSS 变量主题体系共存。
 *
 * 主题联动：未传 colorPrimary 时 antd token 跟随全局双轴主题的运行时值；
 * 显式传入 colorPrimary 则固定主色并**实时派生**整套 `--aura-x-*` 品牌变量
 * （渐变 / 光晕 / 软底 / 边框）注入到子树作用域，换主色即时全量生效；
 * `dark` 同时在子树启用 `data-theme="dark"` 暗色令牌。
 */
export const XProvider: React.FC<XProviderProps> = ({
  children,
  dark = false,
  compact = false,
  colorPrimary,
  locale = zhCN,
}) => {
  const runtime = useRuntimeThemeColors();
  // 显式 props 优先；否则跟随全局双轴主题的当前值
  const effectivePrimary = colorPrimary ?? runtime.colorPrimary;

  const themeConfig = useMemo(
    () =>
      buildXThemeConfig({
        dark,
        compact,
        colorPrimary: effectivePrimary,
        semantic: {
          success: runtime.success,
          warning: runtime.warning,
          error: runtime.error,
          info: runtime.info,
        },
      }),
    [dark, compact, effectivePrimary, runtime],
  );

  // 由主色派生品牌相关变量（accent / 渐变 / 光晕 / 软底 / 边框），
  // 注入到子树作用域——组件消费同名变量，换主色即时全量生效。
  // 未显式传主色时不注入：全局 tokens.css 的主题块已按双轴定义了这些变量。
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
