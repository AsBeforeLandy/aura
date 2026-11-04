import React from 'react';
import { CandlestickChart } from '@aura-react-comp/charts';
import type { CandlestickItem } from '@aura-react-comp/charts';

/**
 * 确定性伪随机：同一个 seed 永远得到同一个值。
 * 用 Math.random 会让每次渲染的数据都变（文档 demo 每次刷新都不一样），
 * 也不利于截图对比。
 */
function rand(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * 造一段像样的行情：价格中枢缓慢上行，每天在合理范围内独立涨跌，影线长度随机。
 * 比「多周期正弦叠加」更接近真实盘面 —— 后者会连出十几根同色蜡烛，像一条斜线。
 */
function buildData(count: number): CandlestickItem[] {
  const result: CandlestickItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const base = 46 + Math.sin(index * 0.42) * 8 + index * 0.55;
    const open = base + (rand(index + 1) - 0.5) * 2.4;
    const close = open + (rand(index + 50) - 0.5) * 7.5;
    const high = Math.max(open, close) + rand(index + 90) * 2.6;
    const low = Math.min(open, close) - rand(index + 130) * 2.6;

    result.push({
      date: `03-${String(index + 1).padStart(2, '0')}`,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: 120000 + Math.round(rand(index + 200) * 280000),
    });
  }

  return result;
}

const DATA = buildData(28);

const Demo: React.FC = () => <CandlestickChart data={DATA} height={380} />;

export default Demo;
