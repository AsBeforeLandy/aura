import React from 'react';
import { AreaChart } from '@aura-react-comp/charts';

const data = [
  { month: '1月', a: 820, b: 700 },
  { month: '2月', a: 900, b: 980 },
  { month: '3月', a: 1050, b: 720 },
  { month: '4月', a: 980, b: 890 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        多系列不堆叠（错误示范：后画的会遮住前面的）
      </div>
      <AreaChart
        data={data}
        xKey="month"
        height={200}
        series={[
          { key: 'a', name: '系列 A' },
          { key: 'b', name: '系列 B' },
        ]}
      />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        多系列堆叠（推荐）
      </div>
      <AreaChart
        data={data}
        xKey="month"
        height={200}
        stack
        series={[
          { key: 'a', name: '系列 A' },
          { key: 'b', name: '系列 B' },
        ]}
      />
    </div>
  </div>
);

export default Demo;
