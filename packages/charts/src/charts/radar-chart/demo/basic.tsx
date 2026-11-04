import React from 'react';
import { RadarChart } from '@aura-react-comp/charts';

const indicators = [
  { name: '性能', max: 100 },
  { name: '易用性', max: 100 },
  { name: '生态', max: 100 },
  { name: '文档', max: 100 },
  { name: '包体积', max: 100 },
  { name: '可定制性', max: 100 },
];

const Demo: React.FC = () => (
  <RadarChart
    height={340}
    indicators={indicators}
    series={[
      { key: 'aura', name: 'Aura Charts', values: [88, 92, 70, 85, 90, 95] },
      { key: 'other', name: '同类方案', values: [80, 74, 95, 88, 45, 60] },
    ]}
  />
);

export default Demo;
