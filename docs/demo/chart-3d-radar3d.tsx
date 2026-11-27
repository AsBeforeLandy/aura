import React, { useState } from 'react';
import {
  Radar3D,
  Scene3D,
  type Radar3DIndicator,
  type Radar3DSeries,
} from '@aura-react-comp/charts-3d';

const indicators: Radar3DIndicator[] = [
  { name: '逻辑推理', max: 100 },
  { name: '代码生成', max: 100 },
  { name: '多模态理解', max: 100 },
  { name: '长文本记忆', max: 100 },
  { name: '响应速度', max: 100 },
  { name: '性价比', max: 100 },
];

const series: Radar3DSeries[] = [
  { name: 'Aura Pro', values: [94, 96, 88, 92, 82, 78] },
  { name: 'Aura Flash', values: [82, 85, 80, 86, 97, 96] },
  { name: '开源基线', values: [76, 80, 68, 72, 84, 90] },
];

/** 三维多维立体分层雷达图：多个模型方案沿高度分层透视对比。 */
export default () => {
  const [layerHeight, setLayerHeight] = useState(30);
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
          aria-pressed={layerHeight === 30}
          style={btnStyle(layerHeight === 30)}
          onClick={() => setLayerHeight(30)}
        >
          标准分层
        </button>
        <button
          type="button"
          aria-pressed={layerHeight === 48}
          style={btnStyle(layerHeight === 48)}
          onClick={() => setLayerHeight(48)}
        >
          拉开层距
        </button>
      </div>
      <Scene3D height={460} cameraPosition={[220, 210, 280]}>
        <Radar3D
          indicators={indicators}
          series={series}
          layerHeight={layerHeight}
          onPointClick={(info) =>
            setPicked(
              `${info.series} · ${info.indicator}：${info.value} / ${info.max}`,
            )
          }
        />
      </Scene3D>
      <p
        role="status"
        style={{ marginTop: 'var(--aura-spacing-3)', marginBottom: 0 }}
      >
        {picked
          ? `已选择：${picked}`
          : '拖动旋转透视各模型能力层级，悬停顶点查看细分得分'}
      </p>
    </div>
  );
};
