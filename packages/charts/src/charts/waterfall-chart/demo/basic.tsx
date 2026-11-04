import React from 'react';
import { WaterfallChart } from '@aura-react-comp/charts';

const data = [
  { name: '期初', value: 0, isTotal: true },
  { name: '线上收入', value: 3200 },
  { name: '门店收入', value: 1800 },
  { name: '渠道成本', value: -1200 },
  { name: '人力成本', value: -900 },
  { name: '期末', value: 0, isTotal: true },
];

const Demo: React.FC = () => <WaterfallChart data={data} height={320} />;

export default Demo;
