import React, { useState } from 'react';
import { Pie3D, Scene3D, type Pie3DDatum } from '@aura-react-comp/charts-3d';

const data: Pie3DDatum[] = [
  { name: 'AI 算力服务', value: 3820 },
  { name: '企业云底座', value: 2760 },
  { name: '数据智能平台', value: 1940 },
  { name: '安全合规套件', value: 1280 },
  { name: '生态插件市场', value: 760 },
];

/** 三维立体占比环图 / 饼图：倒角切块、高度阶梯与悬停弹出动效。 */
export default () => {
  const [donut, setDonut] = useState(true);
  const [heightScale, setHeightScale] = useState(true);
  const [selected, setSelected] = useState<Pie3DDatum | null>(null);

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
          aria-pressed={donut}
          style={btnStyle(donut)}
          onClick={() => setDonut((prev) => !prev)}
        >
          {donut ? '3D 立体环图' : '3D 实心饼图'}
        </button>
        <button
          type="button"
          aria-pressed={heightScale}
          style={btnStyle(heightScale)}
          onClick={() => setHeightScale((prev) => !prev)}
        >
          高度阶梯
        </button>
      </div>
      <Scene3D height={440} cameraPosition={[190, 220, 260]}>
        <Pie3D
          data={data}
          innerRadius={donut ? 48 : 0}
          heightScale={heightScale}
          onSliceClick={setSelected}
        />
      </Scene3D>
      <p
        role="status"
        style={{ marginTop: 'var(--aura-spacing-3)', marginBottom: 0 }}
      >
        {selected
          ? `已选择：${selected.name}（营收 ${selected.value} 万元）`
          : '悬停切片可径向弹出查看占比，点击选择业务板块'}
      </p>
    </div>
  );
};
