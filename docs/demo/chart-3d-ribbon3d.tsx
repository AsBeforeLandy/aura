import React, { useState } from 'react';
import {
  Ribbon3D,
  Scene3D,
  type Ribbon3DSeries,
} from '@aura-react-comp/charts-3d';

const categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'];

const series: Ribbon3DSeries[] = [
  { name: '华东区', values: [120, 148, 162, 155, 194, 218, 242, 268] },
  { name: '华北区', values: [96, 118, 134, 146, 162, 178, 195, 214] },
  { name: '华南区', values: [88, 102, 126, 138, 150, 184, 206, 228] },
  { name: '海外区', values: [54, 68, 82, 108, 132, 158, 182, 224] },
];

/** 三维多系列趋势丝带：沿 Z 轴错落排布，悬停单系列聚焦对比。 */
export default () => {
  const [smooth, setSmooth] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: 'var(--aura-spacing-1) var(--aura-spacing-3)',
    borderRadius: 'var(--aura-radius-sm)',
    border: '1px solid var(--aura-border)',
    background: active ? 'var(--aura-primary-600)' : 'var(--aura-bg-secondary)',
    color: active ? 'var(--aura-text-inverse)' : 'var(--aura-text)',
    fontSize: 'var(--aura-font-size-xs)',
    cursor: 'pointer',
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--aura-spacing-2)',
          marginBottom: 'var(--aura-spacing-3)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          aria-pressed={smooth}
          style={btnStyle(smooth)}
          onClick={() => setSmooth((prev) => !prev)}
        >
          平滑样条
        </button>
        <button
          type="button"
          aria-pressed={showNodes}
          style={btnStyle(showNodes)}
          onClick={() => setShowNodes((prev) => !prev)}
        >
          节点光珠
        </button>
      </div>
      <Scene3D height={460} cameraPosition={[260, 210, 320]}>
        <Ribbon3D
          categories={categories}
          series={series}
          smooth={smooth}
          showNodes={showNodes}
          onPointClick={(info) =>
            setPicked(`${info.series} · ${info.category}：${info.value}`)
          }
        />
      </Scene3D>
      <p
        role="status"
        style={{ marginTop: 'var(--aura-spacing-3)', marginBottom: 0 }}
      >
        {picked
          ? `已选择：${picked}`
          : '拖动旋转视角，悬停丝带或节点聚焦单条序列，点击查看节点详情'}
      </p>
    </div>
  );
};
