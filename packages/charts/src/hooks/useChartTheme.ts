import { useEffect, useState } from 'react';
import { resolveTheme, type ChartTheme, type ChartThemeInput } from '../theme';

/**
 * 解析图表主题，并在主题属性变化时重新读取。
 *
 * 为什么需要订阅：Aura 的主题是 `document.documentElement` 上的双轴属性
 * （`data-mode`=明暗 × `data-palette`=色板，见 ui/theme/tokens.css）。
 * 图表颜色若是挂载时读一次，用户点切换后图表会停在旧配色 ——
 * 视觉上和整站脱节。旧的 `data-theme` 键继续监听以兼容历史用法。
 */
export function useChartTheme(
  input?: ChartThemeInput,
  palette?: string[],
): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(() => resolveTheme(input));

  useEffect(() => {
    const update = () => {
      const next = resolveTheme(input);
      setTheme(palette && palette.length ? { ...next, palette } : next);
    };

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
      attributeFilter: [
        'data-mode',
        'data-palette',
        'data-theme',
        'class',
        'style',
      ],
    });
    return () => observer.disconnect();
  }, [input, palette]);

  return theme;
}
