import React from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { ChartTheme } from '../theme';
import type { TooltipConfig, TooltipPayload } from '../types';

export interface TooltipProps {
  payload: TooltipPayload | null;
  /** 相对容器的像素位置 */
  x: number;
  y: number;
  /** 容器宽度，用于防止 tooltip 溢出右边界 */
  containerWidth: number;
  /** 容器高度；传入后会在上方放不下时自动翻到下方 */
  containerHeight?: number;
  theme: ChartTheme;
  config?: boolean | TooltipConfig;
}

const TOOLTIP_MAX_WIDTH = 280;
const EDGE_GAP = 8;
/** tooltip 与锚点之间的间隙 */
const HEAD_GAP = 12;

/**
 * 悬浮提示。
 *
 * 渲染为绝对定位的 DOM 而非 SVG foreignObject：
 *   · foreignObject 在部分导出/打印场景下会失效；
 *   · DOM 能自然继承字体与换行，样式维护成本更低。
 */
export function Tooltip({
  payload,
  x,
  y,
  containerWidth,
  containerHeight,
  theme,
  config,
}: TooltipProps) {
  if (!payload || config === false) return null;
  const options: TooltipConfig = typeof config === 'object' ? config : {};
  if (options.show === false) return null;

  const custom = options.formatter?.(payload);
  if (custom === null) return null;

  // 水平收敛：按「最大宽度的一半」留足空间，避免贴边被裁
  const half = TOOLTIP_MAX_WIDTH / 2;
  const clampedX = Math.max(
    Math.min(x, containerWidth - half - EDGE_GAP),
    Math.min(half + EDGE_GAP, Math.max(0, containerWidth / 2)),
  );

  /**
   * 垂直翻转：默认浮在锚点上方，上方放不下就翻到下方。
   *
   * 高度估算而非测量——测量要等一帧，会看到 tooltip 先闪错位置。
   * 标题一行 + 每行数据约 18px，估得略大为好（宁可提前翻转）。
   */
  const estimatedHeight = 30 + payload.series.length * 18;
  const fitsAbove = y - estimatedHeight - EDGE_GAP >= 0;
  const placeBelow = Boolean(containerHeight) && !fitsAbove;

  const top = placeBelow ? y + 12 : Math.max(y - HEAD_GAP, 0);

  return (
    <div
      className={classNames(prefixCls('chart__tooltip'))}
      style={{
        left: clampedX,
        top,
        transform: placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
        background: theme.tooltip.background,
        borderColor: theme.tooltip.border,
        color: theme.tooltip.text,
        boxShadow: theme.tooltip.shadow,
        borderRadius: theme.tooltip.radius,
      }}
      role="tooltip"
    >
      <div className={prefixCls('chart__tooltip-title')}>{payload.label}</div>
      {custom ?? (
        <>
          {payload.series.map((item) => (
            <div key={item.key} className={prefixCls('chart__tooltip-item')}>
              <span className={prefixCls('chart__tooltip-label')}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: item.color,
                    flex: '0 0 auto',
                  }}
                />
                {item.name}
              </span>
              <span className={prefixCls('chart__tooltip-value')}>
                {item.formatted}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
