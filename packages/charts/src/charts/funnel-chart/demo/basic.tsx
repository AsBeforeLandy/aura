import React from 'react';
import { FunnelChart } from '@aura-react-comp/charts';

const data = [
  { name: '访问商品页', value: 12000 },
  { name: '加入购物车', value: 6400 },
  { name: '进入结算', value: 3200 },
  { name: '支付成功', value: 1850 },
];

const Demo: React.FC = () => <FunnelChart data={data} height={320} />;

export default Demo;
