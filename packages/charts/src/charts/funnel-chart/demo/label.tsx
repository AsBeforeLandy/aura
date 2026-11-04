import React from 'react';
import { FunnelChart } from '@aura-react-comp/charts';

const data = [
  { name: '投递简历', value: 3200 },
  { name: '简历通过', value: 1200 },
  { name: '初试', value: 520 },
  { name: '复试', value: 210 },
  { name: '发放 offer', value: 86 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 24 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        标签内嵌
      </div>
      <FunnelChart data={data} height={260} label="inside" />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        标签外置：额外显示相对首层的转化率
      </div>
      <FunnelChart data={data} height={260} label="right" gap={6} />
    </div>
  </div>
);

export default Demo;
