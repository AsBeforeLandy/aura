import React from 'react';
import { PieChart } from '@aura-react-comp/charts';
import { formatNumber } from '@aura-react-comp/charts';

const data = [
  { name: '移动端', value: 5820 },
  { name: '桌面端', value: 2410 },
  { name: '平板', value: 760 },
];

const Demo: React.FC = () => (
  <PieChart
    data={data}
    height={340}
    innerRadius={0.66}
    label="inside"
    centerContent={
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>
          {formatNumber(8990)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--aura-text-secondary)' }}>
          总访问量
        </div>
      </div>
    }
  />
);

export default Demo;
