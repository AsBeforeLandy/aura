// 主题派生工具：从主色推导 --aura-x-* 动态变量（渐变 / 透明度 / 光晕）。
// 仅处理 hex 输入（#rgb / #rrggbb）；无法解析时返回 null，由调用方兜底。

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.trim().replace(/^#/, '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const value = parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** hex → rgba() 字符串 */
export function toRgba(hex: string, alpha: number): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** 向白色混合（ratio = 0 原色，1 纯白）——用于渐变的亮端 */
export function lighten(hex: string, ratio: number): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const mixed = rgb.map((channel) =>
    Math.round(channel + (255 - channel) * ratio),
  );
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** 由主色派生的 CSS 变量集（对应 tokens.css 中 --aura-x-* 的品牌相关子集） */
export function deriveAccentVars(
  primary: string,
): Record<string, string> | null {
  const rgb = hexToRgb(primary);
  if (!rgb) return null;

  const lightEnd = lighten(primary, 0.22) ?? primary;
  const glowColor = toRgba(primary, 0.28) ?? `rgba(124, 58, 237, 0.28)`;
  const ringColor = toRgba(primary, 0.16) ?? `rgba(124, 58, 237, 0.16)`;
  const softColor = toRgba(primary, 0.08) ?? `rgba(124, 58, 237, 0.08)`;
  const borderColor = toRgba(primary, 0.22) ?? `rgba(124, 58, 237, 0.22)`;

  return {
    '--aura-x-accent': primary,
    '--aura-x-accent-gradient': `linear-gradient(135deg, ${primary} 0%, ${lightEnd} 100%)`,
    '--aura-x-accent-soft': softColor,
    '--aura-x-bubble-user-bg': `linear-gradient(135deg, ${primary} 0%, ${lightEnd} 100%)`,
    '--aura-x-bubble-border': borderColor,
    '--aura-x-glow': `0 0 0 1px ${toRgba(primary, 0.16)}, 0 12px 32px -8px ${glowColor}`,
    '--aura-x-focus-ring': `0 0 0 3px ${ringColor}`,
  };
}
