import React from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { ChartTheme } from '../theme';
import type { LegendConfig } from '../types';

export interface LegendItem {
  key: string;
  name: string;
  color: string;
  visible: boolean;
}

export interface LegendProps {
  items: LegendItem[];
  theme: ChartTheme;
  config?: boolean | LegendConfig;
  onToggle: (key: string) => void;
}

/**
 * 图例。
 *
 * 刻意用 DOM 而不是画进 SVG：
 *   · 可以用原生 button，键盘可达、可聚焦，天然符合无障碍要求；
 *   · 换行、省略号交给 CSS，省去手写文本换行计算。
 */
export function Legend({ items, theme, config, onToggle }: LegendProps) {
  if (config === false || items.length === 0) return null;

  const options: LegendConfig = typeof config === 'object' ? config : {};
  const { position = 'top', align = 'left' } = options;
  if (options.show === false) return null;

  return (
    <div
      className={classNames(
        prefixCls('chart__legend'),
        position === 'bottom' && prefixCls('chart__legend--bottom'),
        align !== 'left' && prefixCls(`chart__legend--${align}`),
      )}
      role="group"
      aria-label="图例"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={classNames(
            prefixCls('chart__legend-item'),
            !item.visible && prefixCls('chart__legend-item--inactive'),
          )}
          aria-pressed={item.visible}
          title={`${item.visible ? '隐藏' : '显示'} ${item.name}`}
          onClick={() => onToggle(item.key)}
        >
          <span
            className={prefixCls('chart__legend-dot')}
            style={{ background: item.color, opacity: item.visible ? 1 : 0.5 }}
          />
          <span
            style={{
              color: item.visible
                ? theme.legend.text
                : theme.legend.textInactive,
            }}
          >
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
}
