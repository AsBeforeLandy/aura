import React from 'react';
import { CandlestickChart } from '@aura-react-comp/charts';

const DATA = [
  { date: '周一', open: 168, high: 176, low: 165, close: 174 },
  { date: '周二', open: 174, high: 179, low: 170, close: 171 },
  { date: '周三', open: 171, high: 173, low: 162, close: 164 },
  { date: '周四', open: 164, high: 170, low: 161, close: 169 },
  { date: '周五', open: 169, high: 182, low: 168, close: 180 },
  { date: '周六', open: 180, high: 186, low: 177, close: 178 },
  { date: '周日', open: 178, high: 181, low: 172, close: 173 },
];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        精简版：无成交量副图、只保留一条 MA5（国内配色，红涨绿跌）
      </div>
      <CandlestickChart data={DATA} height={240} showVolume={false} ma={[5]} />
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        国际惯例配色（绿涨红跌）—— 面向海外市场时对调两个颜色即可
      </div>
      <CandlestickChart
        data={DATA}
        height={240}
        showVolume={false}
        ma={[]}
        upColor="#22c55e"
        downColor="#ef4444"
      />
    </div>
  </div>
);

export default Demo;
