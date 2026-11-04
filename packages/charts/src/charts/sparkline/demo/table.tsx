import React from 'react';
import { Sparkline } from '@aura-react-comp/charts';

const rows = [
  { name: '华东', amount: 128400, trend: [30, 34, 32, 41, 45, 44, 52] },
  { name: '华南', amount: 96200, trend: [40, 38, 39, 35, 32, 30, 28] },
  { name: '华北', amount: 75100, trend: [20, 24, 22, 26, 25, 29, 31] },
];

const Demo: React.FC = () => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
    <thead>
      <tr style={{ textAlign: 'left', color: 'var(--aura-text-secondary)' }}>
        <th style={{ padding: '6px 8px', fontWeight: 500 }}>区域</th>
        <th style={{ padding: '6px 8px', fontWeight: 500 }}>销售额</th>
        <th style={{ padding: '6px 8px', fontWeight: 500 }}>近 7 日趋势</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr
          key={row.name}
          style={{ borderTop: '1px solid var(--aura-border)' }}
        >
          <td style={{ padding: '8px' }}>{row.name}</td>
          <td style={{ padding: '8px', fontVariantNumeric: 'tabular-nums' }}>
            ¥{row.amount.toLocaleString()}
          </td>
          <td style={{ padding: '8px' }}>
            <Sparkline
              data={row.trend}
              width={110}
              height={28}
              type="area"
              color={
                row.trend[row.trend.length - 1] >= row.trend[0]
                  ? '#7c3aed'
                  : '#10b981'
              }
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Demo;
