import React from 'react';
import { Chart } from '@aura-react-comp/charts';
import type { ChartOption } from '@aura-react-comp/charts';

/**
 * 配置由外部动态生成 —— 这正是 option 式 API 的核心价值：
 * 后端/AI 只要吐出 JSON，前端不需要写任何 JSX 分支。
 */
const buildOption = (
  series: { name: string; data: number[] }[],
): ChartOption => ({
  xAxis: { data: ['周一', '周二', '周三', '周四', '周五'] },
  color: ['#7c3aed', '#0ea5e9', '#10b981'],
  series: series.map((item) => ({ type: 'line' as const, ...item })),
});

const Demo: React.FC = () => (
  <Chart
    option={buildOption([
      { name: '访问量', data: [820, 932, 901, 934, 1290] },
      { name: '下单量', data: [220, 282, 291, 334, 390] },
    ])}
    height={300}
  />
);

export default Demo;
