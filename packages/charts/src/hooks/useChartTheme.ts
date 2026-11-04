import { useEffect, useState } from 'react';
import { resolveTheme, type ChartTheme, type ChartThemeInput } from '../theme';

/**
 * 解析图表主题，并在 `data-theme` 变化时重新读取。
 *
 * 为什么需要订阅：Aura 的暗色模式是通过 `document.documentElement.dataset.theme`
 * 切换的（见 ui/theme/ThemeProvider）。图表颜色若是挂载时读一次，
 * 用户点切换后图表会停在旧配色 —— 视觉上和整站脱节。
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
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, [input, palette]);

  return theme;
}
