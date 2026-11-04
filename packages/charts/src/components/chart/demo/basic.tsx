import React from 'react';
import { Chart } from '@aura-react-comp/charts';

/**
 * 一段从 ECharts 迁移过来的配置。
 * 只改组件名，option 结构保持不变。
 */
const option = {
  title: { text: '月度销售', subtext: '数据来源：内部 BI' },
  xAxis: { data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { name: '销售额（万）' },
  tooltip: { trigger: 'axis' as const },
  series: [
    {
      type: 'bar' as const,
      name: '线上',
      data: [320, 280, 410, 520, 480, 610],
    },
    {
      type: 'line' as const,
      name: '门店',
      data: [180, 210, 240, 300, 290, 340],
      smooth: true,
    },
  ],
};

const Demo: React.FC = () => <Chart option={option} height={320} />;

export default Demo;
