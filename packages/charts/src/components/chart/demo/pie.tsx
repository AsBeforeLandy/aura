import React from 'react';
import { Chart } from '@aura-react-comp/charts';

const Demo: React.FC = () => (
  <Chart
    height={320}
    option={{
      title: { text: '流量来源' },
      xAxis: { data: ['直接访问', '搜索引擎', '社交媒体', '邮件营销'] },
      legend: { show: true },
      series: [
        {
          type: 'pie',
          name: '来源',
          data: [3350, 2580, 1540, 860],
        },
      ],
    }}
  />
);

export default Demo;
