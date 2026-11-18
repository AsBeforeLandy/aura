import React from 'react';
import { formatNumber } from '@aura-react-comp/charts';

/**
 * 场景图例：挂在 Scene3D 的 DOM 覆盖层上的轻量图例。
 *
 * 图例属于「图表的一部分」，由图表组件通过 useScene().setOverlay 声明；
 * 这里只提供两种标准形态。深色底配色与 Scene3D 的提示框一致。
 */

const PANEL: React.CSSProperties = {
  position: 'absolute',
  right: 14,
  top: 12,
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 11,
  lineHeight: 1.5,
  pointerEvents: 'none',
};

/** 色带图例：渐变条 + 两端数值标注（Bar3D / Surface3D / 按值散点） */
export function ColorBandLegend({
  min,
  max,
  colorRange,
  label,
}: {
  min: number;
  max: number;
  colorRange: string[];
  label?: string;
}) {
  const gradient = `linear-gradient(to right, ${colorRange.join(', ')})`;
  return (
    <div style={PANEL}>
      {label ? (
        <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      ) : null}
      <div
        style={{
          width: 120,
          height: 8,
          borderRadius: 4,
          background: gradient,
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#94a3b8',
          marginTop: 3,
        }}
      >
        <span>{formatNumber(min, { compact: true })}</span>
        <span>{formatNumber(max, { compact: true })}</span>
      </div>
    </div>
  );
}

/** 类别图例：色点 + 名称（Scatter3D 的 category 着色模式） */
export function CategoryLegend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <div style={PANEL}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#cbd5e1',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.color,
              flex: '0 0 auto',
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}
