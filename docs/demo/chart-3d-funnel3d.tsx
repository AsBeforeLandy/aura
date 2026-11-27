import React, { useState } from 'react';
import {
  Funnel3D,
  Scene3D,
  type Funnel3DShape,
  type Funnel3DStage,
  type Funnel3DVariant,
} from '@aura-react-comp/charts-3d';

const funnelData: Funnel3DStage[] = [
  { name: '曝光触达', value: 100000 },
  { name: '页面访问', value: 64000 },
  { name: '注册试用', value: 32800 },
  { name: '深度激活', value: 18500 },
  { name: '付费转化', value: 9200 },
];

const pyramidData: Funnel3DStage[] = [
  { name: '核心决策层', value: 1200 },
  { name: '企业旗舰版', value: 4800 },
  { name: '专业成长版', value: 14500 },
  { name: '团队标准版', value: 32000 },
  { name: '免费体验层', value: 68000 },
];

const shapes: { label: string; value: Funnel3DShape }[] = [
  { label: '圆台', value: 'round' },
  { label: '六棱台', value: 'hex' },
  { label: '四棱台', value: 'square' },
];

/** 三维悬浮转化漏斗与层级金字塔：自由切换形态与几何截面。 */
export default () => {
  const [variant, setVariant] = useState<Funnel3DVariant>('funnel');
  const [shape, setShape] = useState<Funnel3DShape>('round');
  const [selected, setSelected] = useState<Funnel3DStage | null>(null);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: 'var(--aura-spacing-1) var(--aura-spacing-3)',
    borderRadius: 'var(--aura-radius-sm)',
    border: '1px solid var(--aura-border)',
    background: active ? 'var(--aura-primary-600)' : 'var(--aura-bg-secondary)',
    color: active ? 'var(--aura-text-inverse)' : 'var(--aura-text)',
    fontSize: 'var(--aura-font-size-xs)',
    cursor: 'pointer',
  });

  const data = variant === 'funnel' ? funnelData : pyramidData;

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
          aria-pressed={variant === 'funnel'}
          style={btnStyle(variant === 'funnel')}
          onClick={() => {
            setVariant('funnel');
            setSelected(null);
          }}
        >
          转化漏斗
        </button>
        <button
          type="button"
          aria-pressed={variant === 'pyramid'}
          style={btnStyle(variant === 'pyramid')}
          onClick={() => {
            setVariant('pyramid');
            setSelected(null);
          }}
        >
          层级金字塔
        </button>
        {shapes.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={shape === item.value}
            style={btnStyle(shape === item.value)}
            onClick={() => setShape(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Scene3D height={460} cameraPosition={[220, 145, 310]}>
        <Funnel3D
          data={data}
          variant={variant}
          shape={shape}
          onStageClick={setSelected}
        />
      </Scene3D>
      <p
        role="status"
        style={{ marginTop: 'var(--aura-spacing-3)', marginBottom: 0 }}
      >
        {selected
          ? `已选择：${selected.name}（规模 ${selected.value.toLocaleString()}）`
          : '悬停任意层级查看环节转化与总转化率，点击选择阶段'}
      </p>
    </div>
  );
};
