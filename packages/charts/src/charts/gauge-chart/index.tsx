import React, { useMemo } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { SceneNode } from '../../scene/types';
import { SvgScene } from '../../scene/svg';
import { arcLinePath } from '../../core/shape';
import { formatNumber } from '../../core/format';
import { withAlpha, type ChartThemeInput } from '../../theme';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useElementSize } from '../../hooks/useElementSize';
import { useChartTransition } from '../../hooks/useChartTransition';
import { resolveAnimation } from '../../core/animation';
import '../../components/chart.less';

export interface GaugeRange {
  /** 该分段的终点值 */
  to: number;
  color: string;
}

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  /** 单位，显示在数值右侧 */
  unit?: string;
  /** 数值下方的说明文字 */
  label?: string;
  /** 分段配色，按区间端点匹配 */
  ranges?: GaugeRange[];
  /** 环宽占半径的比例 */
  thickness?: number;
  /** 弧的起始角度（度），默认 150（左下） */
  startAngle?: number;
  /** 弧的总扫过角度（度），默认 240 */
  sweepAngle?: number;
  width?: number | string;
  height?: number;
  theme?: ChartThemeInput;
  palette?: string[];
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const DEG = Math.PI / 180;

/**
 * 仪表盘。
 *
 * 只表达「一个值在量程中的位置」，不承载多指标比较。
 * 数值以外不加指针：现代仪表盘用填充弧表达进度，指针图形的可读性反而更差
 * （细长指针在 240° 弧上要判断角度，误差远大于判断弧长）。
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  unit = '',
  label,
  ranges,
  thickness = 0.14,
  startAngle = 150,
  sweepAngle = 240,
  width = '100%',
  height = 260,
  theme: themeInput,
  palette,
  animation = true,
  className,
  style,
  ariaLabel,
}: GaugeChartProps) {
  const theme = useChartTheme(themeInput, palette);
  const { ref, size } = useElementSize<HTMLDivElement>();

  const animKey =
    typeof animation === 'object'
      ? JSON.stringify(animation)
      : String(animation);
  const animConfig = useMemo(
    () => resolveAnimation(animation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animKey],
  );

  // 数值做插值：更新时弧长平滑滑到新位置，中心数字同时滚动
  const transition = useChartTransition([[value]], animConfig);
  const progress = transition.progress;
  const animatedValue = transition.values[0]?.[0] ?? value;

  const ratio = useMemo(() => {
    if (max === min) return 0;
    return Math.min(1, Math.max(0, (animatedValue - min) / (max - min)));
  }, [animatedValue, min, max]);

  const color = useMemo(() => {
    if (ranges?.length) {
      const hit = ranges.find((range) => value <= range.to);
      if (hit) return hit.color;
      return ranges[ranges.length - 1].color;
    }
    return theme.emphasis;
  }, [ranges, value, theme.emphasis]);

  const geometry = useMemo(() => {
    // 240° 弧在竖直方向的占用约为 0.87R，据此反推半径，避免上下裁切
    const outer = Math.max(0, Math.min(size.width / 2, size.height / 1.72)) - 6;
    const ring = Math.max(6, outer * thickness);
    return {
      cx: size.width / 2,
      cy: size.height / 2 + outer * 0.28,
      outer,
      inner: outer - ring,
      thickness: ring,
    };
  }, [size.width, size.height, thickness]);

  const start = startAngle * DEG;
  const sweep = sweepAngle * DEG;

  const scene = useMemo<SceneNode[]>(() => {
    const { cx, cy, outer, inner, thickness: ring } = geometry;
    if (outer <= 0) return [];
    const nodes: SceneNode[] = [];

    // 轨道
    nodes.push({
      kind: 'path',
      key: 'track',
      d: arcLinePath(cx, cy, (inner + outer) / 2, start, start + sweep),
      fill: 'none',
      stroke: withAlpha(theme.axis.line, 0.55),
      strokeWidth: ring,
      linecap: 'round',
      pointerEvents: 'none',
    });

    // 进度弧
    const end = start + sweep * ratio * progress;
    if (end > start + 0.001) {
      nodes.push({
        kind: 'path',
        key: 'value-arc',
        d: arcLinePath(cx, cy, (inner + outer) / 2, start, end),
        fill: 'none',
        stroke: color,
        strokeWidth: ring,
        linecap: 'round',
        pointerEvents: 'none',
      });
    }

    // 刻度：11 条短线，每 10% 一条
    // 刻度落在环外侧，长度取环宽的 45%，太短会淹没在环的边缘里
    const tickOuter = outer + ring * 1.05;
    const tickInner = outer + ring * 0.6;
    for (let index = 0; index <= 10; index += 1) {
      const angle = start + (sweep * index) / 10;
      nodes.push({
        kind: 'line',
        key: `tick-${index}`,
        x1: cx + Math.cos(angle) * tickInner,
        y1: cy + Math.sin(angle) * tickInner,
        x2: cx + Math.cos(angle) * tickOuter,
        y2: cy + Math.sin(angle) * tickOuter,
        stroke: index / 10 <= ratio ? color : theme.axis.tick,
        strokeWidth: index % 5 === 0 ? 2 : 1,
        opacity: index / 10 <= ratio ? 0.9 : 0.5,
        pointerEvents: 'none',
      });
    }

    // 量程端点数值
    // 端点标签按容器边界收敛：小卡片里「100」这类标签溢出会被裁成「10C」
    const clampToCard = (value: number, max: number) =>
      Math.min(Math.max(value, 10), Math.max(10, max - 10));

    nodes.push({
      kind: 'text',
      key: 'min-label',
      x: clampToCard(cx + Math.cos(start) * (outer + ring * 0.9), size.width),
      y: clampToCard(cy + Math.sin(start) * (outer + ring * 0.9), size.height),
      text: formatNumber(min),
      fill: theme.text.secondary,
      fontSize: theme.font.sizeSmall,
      anchor: 'middle',
      baseline: 'middle',
      fontFamily: theme.font.family,
    });
    nodes.push({
      kind: 'text',
      key: 'max-label',
      x: clampToCard(
        cx + Math.cos(start + sweep) * (outer + ring * 0.9),
        size.width,
      ),
      y: clampToCard(
        cy + Math.sin(start + sweep) * (outer + ring * 0.9),
        size.height,
      ),
      text: formatNumber(max),
      fill: theme.text.secondary,
      fontSize: theme.font.sizeSmall,
      anchor: 'middle',
      baseline: 'middle',
      fontFamily: theme.font.family,
    });

    // 中心数值
    nodes.push({
      kind: 'text',
      key: 'value',
      x: cx,
      y: cy - 6,
      text: `${formatNumber(Math.round(animatedValue * 10) / 10)}${unit}`,
      fill: theme.text.primary,
      fontSize: Math.max(20, Math.min(34, outer * 0.3)),
      fontWeight: theme.font.weightMedium,
      anchor: 'middle',
      baseline: 'middle',
      fontFamily: theme.font.family,
    });

    if (label) {
      nodes.push({
        kind: 'text',
        key: 'label',
        x: cx,
        y: cy + Math.max(20, outer * 0.16),
        text: label,
        fill: theme.text.secondary,
        fontSize: theme.font.size,
        anchor: 'middle',
        baseline: 'middle',
        fontFamily: theme.font.family,
      });
    }

    return nodes;
  }, [
    geometry,
    start,
    sweep,
    ratio,
    progress,
    color,
    theme,
    animatedValue,
    unit,
    size.width,
    size.height,
    label,
    min,
    max,
  ]);

  const autoAriaLabel =
    ariaLabel ?? `${label ?? '仪表盘'}：${value}${unit}，量程 ${min}~${max}`;

  return (
    <div
      className={classNames(prefixCls('chart'), className)}
      style={{ width, height, ...style }}
      data-aura-chart="gauge"
    >
      <div ref={ref} className={prefixCls('chart__plot')}>
        {size.width > 0 ? (
          <SvgScene
            nodes={scene}
            width={size.width}
            height={size.height}
            ariaLabel={autoAriaLabel}
          />
        ) : null}
      </div>
    </div>
  );
}
