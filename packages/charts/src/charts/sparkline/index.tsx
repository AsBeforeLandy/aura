import React, { useMemo } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { areaPath, linePath } from '../../core/shape';
import { extentOf } from '../../core/scale';
import { withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation, staggerProgress } from '../../core/animation';
import '../../components/chart.less';

export interface SparklineProps {
  data: number[];
  type?: 'line' | 'area' | 'bar';
  width?: number;
  height?: number;
  /** 线条 / 柱子颜色，默认主题强调色 */
  color?: string;
  /** 曲线是否平滑 */
  smooth?: boolean;
  /** 是否高亮最后一个数据点 */
  showLast?: boolean;
  strokeWidth?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/**
 * 迷你图（Sparkline）。
 *
 * 没有坐标轴、没有图例、没有 tooltip —— 它的唯一职责是让读者在扫视表格时
 * 立刻看出「这条数据是在涨还是在跌」。任何额外装饰都会削弱这个目的。
 *
 * 因此它也刻意不提供数值精度：需要读数请用折线图。
 */
export function Sparkline({
  data = [],
  type = 'line',
  width = 120,
  height = 32,
  color,
  smooth = false,
  showLast = false,
  strokeWidth = 1.6,
  theme: themeInput,
  palette,
  animation = true,
  className,
  style,
  ariaLabel,
}: SparklineProps) {
  const theme = useChartTheme(themeInput, palette);
  const accent = color ?? theme.emphasis;
  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  const transition = useChartTransition([data], animConfig);
  const progress = transition.progress;
  const values = transition.values[0] ?? data;

  const points = useMemo(() => {
    if (!values.length) return [];
    const [min, max] = extentOf(values);
    const span = max - min || 1;
    const pad = strokeWidth;
    const innerWidth = Math.max(1, width - pad);
    const innerHeight = Math.max(1, height - pad * 2);

    return values.map((raw, index) => {
      const value = raw ?? 0;
      return {
        x:
          values.length === 1
            ? width / 2
            : pad / 2 + (index / (values.length - 1)) * innerWidth,
        // y 轴翻转：数值越大越靠上
        y: pad + innerHeight - ((value - min) / span) * innerHeight,
        value,
      };
    });
  }, [values, width, height, strokeWidth]);

  const scene = useMemo<SceneNode[]>(() => {
    if (!points.length) return [];
    const nodes: SceneNode[] = [];
    const curve = smooth ? 'smooth' : 'linear';

    if (type === 'bar') {
      const slot = width / Math.max(points.length, 1);
      const barWidth = Math.max(1, slot * 0.6);
      const bottom = height - strokeWidth / 2;
      points.forEach((point, index) => {
        const local = staggerProgress(
          progress,
          index,
          points.length,
          animConfig.stagger,
        );
        const barHeight = Math.max(1, (bottom - point.y) * local);
        nodes.push({
          kind: 'rect',
          key: `bar-${index}`,
          x: point.x - barWidth / 2,
          y: bottom - barHeight,
          width: barWidth,
          height: barHeight,
          radius: 1,
          fill: accent,
          opacity: 0.85,
          pointerEvents: 'none',
        });
      });
      return nodes;
    }

    // 动画：进场时按 progress 从底部抬升
    // 逐点错峰：线条像被画出，而不是整体从底部抬起
    const animated = points.map((point, index) => {
      const local = staggerProgress(
        progress,
        index,
        points.length,
        animConfig.stagger,
      );
      return { x: point.x, y: height + (point.y - height) * local };
    });

    if (type === 'area') {
      nodes.push({
        kind: 'path',
        key: 'area',
        d: areaPath(animated, height, curve),
        fill: withAlpha(accent, 0.16),
        pointerEvents: 'none',
      });
    }

    nodes.push({
      kind: 'path',
      key: 'line',
      d: linePath(animated, curve),
      fill: 'none',
      stroke: accent,
      strokeWidth,
      linecap: 'round',
      linejoin: 'round',
      pointerEvents: 'none',
    });

    if (showLast) {
      const last = animated[animated.length - 1];
      nodes.push({
        kind: 'circle',
        key: 'last',
        cx: last.x,
        cy: last.y,
        r: strokeWidth + 1.2,
        fill: accent,
        strokeWidth: 0,
        pointerEvents: 'none',
      });
    }

    return nodes;
  }, [
    points,
    type,
    width,
    height,
    accent,
    strokeWidth,
    progress,
    showLast,
    smooth,
    animConfig.stagger,
  ]);

  if (!data.length) return null;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="sparkline"
    >
      <div className={prefixCls('chart__plot')}>
        <SvgScene
          nodes={scene}
          width={width}
          height={height}
          ariaLabel={ariaLabel ?? `迷你趋势图，共 ${data.length} 个数据点`}
        />
      </div>
    </div>
  );
}
