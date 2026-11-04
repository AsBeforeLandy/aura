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
  theme: ChartTheme;
  config?: boolean | TooltipConfig;
}

const TOOLTIP_MAX_WIDTH = 280;
const EDGE_GAP = 8;

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
  theme,
  config,
}: TooltipProps) {
  if (!payload || config === false) return null;
  const options: TooltipConfig = typeof config === 'object' ? config : {};
  if (options.show === false) return null;

  const custom = options.formatter?.(payload);
  if (custom === null) return null;

  // 边界收敛：靠近右边缘时左移半个 tooltip 宽度，避免被容器裁掉
  const half = TOOLTIP_MAX_WIDTH / 2;
  const clampedX = Math.min(
    Math.max(x, half * 0.6 + EDGE_GAP),
    Math.max(containerWidth - half * 0.6, half * 0.6),
  );

  return (
    <div
      className={classNames(prefixCls('chart__tooltip'))}
      style={{
        left: clampedX,
        top: Math.max(y - 12, 0),
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
