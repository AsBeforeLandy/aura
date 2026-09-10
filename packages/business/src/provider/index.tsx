import React, { useMemo } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { Locale } from 'antd/es/locale';
import zhCN from 'antd/locale/zh_CN';
import { auraTokens } from '@aura/shared';

export interface BusinessProviderProps {
  children: React.ReactNode;
  /** 暗色模式，自动切换 antd 暗色算法 */
  dark?: boolean;
  /**
   * 主题主色
   * @default auraTokens.colors.primary[700] (#7c3aed)
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
 * BusinessProvider — 业务组件主题桥接
 *
 * 将 Aura 设计令牌映射到 antd 的主题系统，使基于 antd 封装的业务组件
 * 与 Aura 自研组件保持一致的紫罗兰视觉语言。
 *
 * antd v6 默认使用 CSS Variables，因此可与 Aura 的 CSS 变量主题体系共存。
 */
export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
  dark = false,
  colorPrimary,
  borderRadius = 10,
  locale = zhCN,
  compact = false,
}) => {
  const themeConfig = useMemo(() => {
    const algorithms = [dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm];
    if (compact) algorithms.push(antdTheme.compactAlgorithm);

    const primary = colorPrimary ?? auraTokens.colors.primary[700];

    return {
      algorithm: algorithms,
      token: {
        colorPrimary: primary,
        // antd 的 colorLink 默认派生自 colorInfo（见 genColorMapToken）。
        // 若 colorInfo 为语义蓝，链接型元素（Button type="link"、a 标签等）
        // 会呈现蓝色而与品牌主色脱节，故此处显式让链接色跟随主色。
        colorLink: primary,
        colorSuccess: auraTokens.colors.success,
        colorWarning: auraTokens.colors.warning,
        colorError: auraTokens.colors.error,
        colorInfo: auraTokens.colors.info,
        borderRadius,
        borderRadiusLG: 14,
        borderRadiusSM: 6,
        fontSize: 14,
        controlHeight: 34,
      },
    };
  }, [dark, colorPrimary, borderRadius, compact]);

  return (
    <ConfigProvider theme={themeConfig} locale={locale}>
      {children}
    </ConfigProvider>
  );
};

BusinessProvider.displayName = 'BusinessProvider';
