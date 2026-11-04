import React, { useState } from 'react';
import { LineChart } from '@aura-react-comp/charts';
import type { EasingName } from '@aura-react-comp/charts';

const BASE = [
  { month: '1月', orders: 1240, refunds: 280 },
  { month: '2月', orders: 980, refunds: 210 },
  { month: '3月', orders: 1560, refunds: 340 },
  { month: '4月', orders: 1890, refunds: 420 },
  { month: '5月', orders: 2210, refunds: 380 },
  { month: '6月', orders: 1980, refunds: 460 },
];

const EASINGS: EasingName[] = [
  'easeOutQuint',
  'easeOutCubic',
  'easeInOutCubic',
  'linear',
];

const Demo: React.FC = () => {
  const [duration, setDuration] = useState(620);
  const [easing, setEasing] = useState<EasingName>('easeOutQuint');
  const [stagger, setStagger] = useState(0.35);
  const [seed, setSeed] = useState(0);
  const [data, setData] = useState(BASE);

  /** 换一组数据：图表会在旧值和新值之间插值，而不是重播入场 */
  const shuffle = () => {
    setData((prev) =>
      prev.map((row) => ({
        ...row,
        orders: Math.max(
          200,
          Math.round(row.orders * (0.55 + Math.random() * 0.9)),
        ),
        refunds: Math.max(
          60,
          Math.round(row.refunds * (0.55 + Math.random() * 0.9)),
        ),
      })),
    );
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          fontSize: 12,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          时长
          <input
            type="range"
            min={120}
            max={1600}
            step={20}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
          <span style={{ width: 48, fontVariantNumeric: 'tabular-nums' }}>
            {duration}ms
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          错峰
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={stagger}
            onChange={(event) => setStagger(Number(event.target.value))}
          />
          <span style={{ width: 32, fontVariantNumeric: 'tabular-nums' }}>
            {stagger}
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          缓动
          <select
            value={easing}
            onChange={(event) => setEasing(event.target.value as EasingName)}
          >
            {EASINGS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={() => setSeed((value) => value + 1)}>
          重播入场
        </button>
        <button type="button" onClick={shuffle}>
          换一组数据
        </button>
      </div>

      <LineChart
        key={seed}
        data={data}
        xKey="month"
        height={300}
        smooth
        animation={{ duration, easing, stagger }}
        series={[
          { key: 'orders', name: '订单量' },
          { key: 'refunds', name: '退款量' },
        ]}
      />
    </div>
  );
};

export default Demo;
