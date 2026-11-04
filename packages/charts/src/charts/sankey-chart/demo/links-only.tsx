import React from 'react';
import { SankeyChart } from '@aura-react-comp/charts';

/** 只传 links，节点由组件自动推导 */
const links = [
  { source: '总预算', target: '研发', value: 620 },
  { source: '总预算', target: '市场', value: 280 },
  { source: '总预算', target: '运营', value: 180 },
  { source: '研发', target: '人力', value: 420 },
  { source: '研发', target: '云资源', value: 130 },
  { source: '研发', target: '工具订阅', value: 70 },
  { source: '市场', target: '广告投放', value: 190 },
  { source: '市场', target: '内容制作', value: 90 },
  { source: '运营', target: '活动', value: 110 },
  { source: '运营', target: '客服', value: 70 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        只给 links，节点自动推导
      </div>
      <SankeyChart links={links} height={320} nodeGap={14} />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        关闭数值标签，只保留节点名
      </div>
      <SankeyChart links={links} height={200} showValue={false} nodeWidth={8} />
    </div>
  </div>
);

export default Demo;
