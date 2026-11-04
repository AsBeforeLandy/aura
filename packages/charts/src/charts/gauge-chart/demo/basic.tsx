import React from 'react';
import { GaugeChart } from '@aura-react-comp/charts';

const Demo: React.FC = () => (
  <GaugeChart value={72} unit="%" label="任务完成度" height={260} />
);

export default Demo;
