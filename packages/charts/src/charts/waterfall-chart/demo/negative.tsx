import React from 'react';
import { WaterfallChart } from '@aura-react-comp/charts';

const data = [
  { name: 'Q1', value: 420 },
  { name: 'Q2', value: -180 },
  { name: 'Q3', value: 260 },
  { name: 'Q4', value: -320 },
  { name: '全年', value: 0, isTotal: true },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        含负增长：零基线会显式画出，减少项向下生长
      </div>
      <WaterfallChart data={data} height={260} />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        关闭连接线
      </div>
      <WaterfallChart data={data} height={220} connector={false} />
    </div>
  </div>
);

export default Demo;
