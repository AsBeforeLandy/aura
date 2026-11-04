import React from 'react';
import { ScatterChart } from '@aura-react-comp/charts';

/** 模拟一批商品的「价格 - 销量」观测值 */
const data = Array.from({ length: 40 }, (_, index) => {
  const price = 20 + index * 4;
  // 价格越高销量越低，叠加一点噪声
  const noise = ((index * 37) % 11) - 5;
  return { price, sales: Math.max(5, Math.round(420 - price * 6 + noise * 6)) };
});

const Demo: React.FC = () => (
  <ScatterChart
    data={data}
    xKey="price"
    height={320}
    series={[{ key: 'sales', name: '销量' }]}
  />
);

export default Demo;
