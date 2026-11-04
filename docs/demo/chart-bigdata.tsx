import React from 'react';
import { LineChart } from '@aura-react-comp/charts';

/** 8000 个点的信号：低频趋势 + 高频抖动 + 偶发尖峰 */
const DATA = Array.from({ length: 8000 }, (_, index) => ({
  i: `${index}`,
  v:
    100 +
    Math.sin(index / 900) * 40 +
    Math.sin(index / 37) * 9 +
    (index % 917 === 0 ? 55 : 0),
}));

const series = [{ key: 'v', name: '信号' }];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        8000 点 + 缩略轴（默认采样到 800 点，拖动窗口看局部）
      </div>
      <LineChart data={DATA} xKey="i" series={series} dataZoom height={300} />
    </div>

    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        关闭采样：8000 个点全量渲染（细节更完整，但滚动会明显变重）
      </div>
      <LineChart
        data={DATA}
        xKey="i"
        series={series}
        sampling={false}
        height={220}
      />
    </div>
  </div>
);

export default Demo;
