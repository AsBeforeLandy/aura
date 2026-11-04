import React from 'react';
import { LineChart } from '@aura-react-comp/charts';

const gapData = [
  { day: '周一', value: 120 },
  { day: '周二', value: null },
  { day: '周三', value: 180 },
  { day: '周四', value: 90 },
  { day: '周五', value: null },
  { day: '周六', value: 240 },
];

const emptyData: { day: string; value: number }[] = [];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        缺失值（null 会断开折线，而不是画到 0）
      </div>
      <LineChart
        data={gapData}
        xKey="day"
        height={200}
        series={[{ key: 'value', name: '访问量' }]}
      />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        空数据
      </div>
      <LineChart
        data={emptyData}
        xKey="day"
        height={160}
        emptyText="暂无数据"
        series={[{ key: 'value', name: '访问量' }]}
      />
    </div>
  </div>
);

export default Demo;
