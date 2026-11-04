import React, { useMemo } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { arcLinePath } from '../../core/shape';
import { formatPercent } from '../../core/format';
import { withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation } from '../../core/animation';
import '../../components/chart.less';

export interface RingProgressProps {
  /** 当前值 */
  value: number;
  /** 满值，默认 100 */
  max?: number;
  /** 正方形边长 */
  size?: number;
  /** 环宽（像素） */
  thickness?: number;
  /** 进度颜色，默认取主题强调色 */
  color?: string;
  /** 轨道颜色 */
  trackColor?: string;
  /** 起点角度（度），默认 -90 即正上方 */
  startAngle?: number;
  /** 圆角端点 */
  round?: boolean;
  /** 是否在中心显示百分比，默认 true */
  showPercent?: boolean;
  /** 中心显示的自定义内容，优先级高于 showPercent */
  children?: React.ReactNode;
  theme?: ChartThemeInput;
  palette?: string[];
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const DEG = Math.PI / 180;

/**
 * 环形进度。
 *
 * 与 GaugeChart 的分工：仪表盘强调「在量程中的位置」（带刻度与端点），
 * 环形进度强调「完成度」（无刻度、更紧凑），常用于表格单元格与卡片角落。
 */
export function RingProgress({
  value,
  max = 100,
  size = 160,
  thickness = 12,
  color,
  trackColor,
  startAngle = -90,
  round = true,
  showPercent = true,
  children,
  theme: themeInput,
  palette,
  animation = true,
  className,
  style,
  ariaLabel,
}: RingProgressProps) {
  const theme = useChartTheme(themeInput, palette);
  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const transition = useChartTransition([[value]], animConfig);
  const progress = transition.progress;
  const animatedValue = transition.values[0]?.[0] ?? value;

  const ratio = useMemo(() => {
    if (max === 0) return 0;
    return Math.min(1, Math.max(0, animatedValue / max));
  }, [animatedValue, max]);

  const accent = color ?? theme.emphasis;
  const track = trackColor ?? withAlpha(theme.axis.line, 0.6);

  const geometry = useMemo(() => {
    const center = size / 2;
    const radius = Math.max(0, center - thickness / 2 - 1);
    return { cx: center, cy: center, radius, arc: radius * 2 * Math.PI };
  }, [size, thickness]);

  const start = startAngle * DEG;
  const end = start + Math.PI * 2 * ratio * progress;

  const scene = useMemo<SceneNode[]>(() => {
    const { cx, cy, radius } = geometry;
    if (radius <= 0) return [];
    const nodes: SceneNode[] = [];

    nodes.push({
      kind: 'path',
      key: 'track',
      d: arcLinePath(cx, cy, radius, 0, Math.PI * 2),
      fill: 'none',
      stroke: track,
      strokeWidth: thickness,
      pointerEvents: 'none',
    });

    if (end > start + 0.0001) {
      nodes.push({
        kind: 'path',
        key: 'value',
        d: arcLinePath(cx, cy, radius, start, end),
        fill: 'none',
        stroke: accent,
        strokeWidth: thickness,
        linecap: round ? 'round' : 'butt',
        pointerEvents: 'none',
      });
    }

    return nodes;
  }, [geometry, start, end, track, accent, thickness, round]);

  const autoAriaLabel = ariaLabel ?? `进度：${Math.round(ratio * 100)}%`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width: size, height: size, position: 'relative', ...style }}
      data-aura-chart="ring-progress"
      role="img"
      aria-label={autoAriaLabel}
    >
      <div className={prefixCls('chart__plot')}>
        <SvgScene
          nodes={scene}
          width={size}
          height={size}
          ariaLabel={autoAriaLabel}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {children ??
          (showPercent ? (
            <span
              style={{
                fontSize: Math.max(14, size * 0.16),
                fontWeight: theme.font.weightMedium,
                color: theme.text.primary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatPercent(value, max || 1, 0)}
            </span>
          ) : null)}
      </div>
    </div>
  );
}
