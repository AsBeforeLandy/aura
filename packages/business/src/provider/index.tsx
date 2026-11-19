import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { Locale } from 'antd/es/locale';
import zhCN from 'antd/locale/zh_CN';
import {
  antdTokenOverrides,
  readRuntimeAuraColors,
  type RuntimeAuraColors,
} from '@aura-react-comp/shared';

export interface BusinessProviderProps {
  children: React.ReactNode;
  /** 暗色模式，自动切换 antd 暗色算法 */
  dark?: boolean;
  /**
   * 主题主色
   * @default 运行时读取 --aura-primary-700（随全局双轴主题联动），
   *   令牌不可用时回退 auraTokens.colors.primary[700] (#7c3aed)
   */
  colorPrimary?: string;
  /**
   * 组件基础圆角
   * @default 10
   */
  borderRadius?: number;
  /**
   * 语言包
   * @default zhCN
   */
  locale?: Locale;
  /** 是否启用紧凑模式 */
  compact?: boolean;
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
 * BusinessProvider — 业务组件主题桥接
 *
 * 将 Aura 设计令牌映射到 antd 的主题系统，使基于 antd 封装的业务组件
 * 与 Aura 自研组件保持一致的视觉语言。
 *
 * antd v6 默认使用 CSS Variables，因此可与 Aura 的 CSS 变量主题体系共存。
 * 主色与语义色默认**运行时读取**全局令牌：切换 data-mode / data-palette
 * 后 Provider 自动拿到当前色板的值；显式传入 colorPrimary 可固定主色。
 */
export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
  dark = false,
  colorPrimary,
  borderRadius = 10,
  locale = zhCN,
  compact = false,
}) => {
  const runtime = useRuntimeThemeColors();
  // 显式 props 优先；否则跟随全局双轴主题的当前值
  const effectivePrimary = colorPrimary ?? runtime.colorPrimary;

  const themeConfig = useMemo(() => {
    const algorithms = [
      dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    ];
    if (compact) algorithms.push(antdTheme.compactAlgorithm);

    return {
      algorithm: algorithms,
      // Aura 令牌 → antd token 的映射收敛在 @aura-react-comp/shared（与 @aura-react-comp/x 共用单一数据源）
      token: antdTokenOverrides(effectivePrimary, {
        success: runtime.success,
        warning: runtime.warning,
        error: runtime.error,
        info: runtime.info,
      }),
    };
  }, [dark, compact, effectivePrimary, runtime, borderRadius]);

  return (
    <ConfigProvider theme={themeConfig} locale={locale}>
      {children}
    </ConfigProvider>
  );
};

BusinessProvider.displayName = 'BusinessProvider';
