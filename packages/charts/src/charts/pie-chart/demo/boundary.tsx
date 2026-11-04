import React from 'react';
import { PieChart } from '@aura-react-comp/charts';

const many = Array.from({ length: 12 }, (_, index) => ({
  name: `分类 ${index + 1}`,
  value: 400 - index * 22,
}));

const withZero = [
  { name: '有数据', value: 100 },
  { name: '零值', value: 0 },
  { name: '另一项', value: 60 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        12 个分类：色板会循环，超过 6 类时建议改用条形图
      </div>
      <PieChart data={many} height={240} label={false} innerRadius={0.5} />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        含零值：不产生扇区也不报错
      </div>
      <PieChart data={withZero} height={220} label="inside" innerRadius={0.5} />
    </div>
  </div>
);

export default Demo;
