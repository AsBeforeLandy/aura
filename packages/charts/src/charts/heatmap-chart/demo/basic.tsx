import React from 'react';
import { HeatmapChart } from '@aura-react-comp/charts';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const HOURS = [
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '22',
];

/** 访问量形态：早晚高峰 + 周末白天更活跃，用确定性函数生成便于复现 */
const data = DAYS.flatMap((day, dayIndex) =>
  HOURS.map((hour, hourIndex) => {
    const weekend = dayIndex >= 5;
    const morning = Math.exp(-((hourIndex - 4) ** 2) / 3) * (weekend ? 40 : 90);
    const evening = Math.exp(-((hourIndex - 8) ** 2) / 5) * 100;
    const base = weekend ? 30 : 18;
    return { x: hour, y: day, value: Math.round(base + morning + evening) };
  }),
);

const Demo: React.FC = () => (
  <HeatmapChart data={data} xLabels={HOURS} yLabels={DAYS} height={300} />
);

export default Demo;
