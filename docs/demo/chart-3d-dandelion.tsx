import React, { useState } from 'react';
import { DandelionField } from '@aura-react-comp/charts-3d';

type MoodKey = 'night' | 'dusk' | 'mist';

const MOODS: Record<
  MoodKey,
  {
    label: string;
    background: string;
    seedColor: string;
    accentColor: string;
    stemColor: string;
    titleColor: string;
    descColor: string;
  }
> = {
  night: {
    label: '星夜微风',
    background:
      'radial-gradient(ellipse at 26% 62%, #1b2848 0%, #0b1224 58%, #060913 100%)',
    seedColor: '#f8fafc',
    accentColor: '#a78bfa',
    stemColor: '#4b6b5c',
    titleColor: '#f8fafc',
    descColor: 'rgba(226, 232, 240, 0.78)',
  },
  dusk: {
    label: '暮色暖金',
    background:
      'radial-gradient(ellipse at 26% 62%, #3b234a 0%, #1c132b 58%, #0e0a18 100%)',
    seedColor: '#fef3c7',
    accentColor: '#fbbf24',
    stemColor: '#6b6456',
    titleColor: '#fffbeb',
    descColor: 'rgba(254, 243, 199, 0.76)',
  },
  mist: {
    label: '晨雾清风',
    background:
      'radial-gradient(ellipse at 26% 62%, #e0f2fe 0%, #f1f5f9 60%, #e2e8f0 100%)',
    seedColor: '#334155',
    accentColor: '#0284c7',
    stemColor: '#475569',
    titleColor: '#0f172a',
    descColor: 'rgba(51, 65, 85, 0.82)',
  },
};

/** 蒲公英被风吹散的 3D 氛围背景：支持点击掀风、重聚与多套氛围切换。 */
export default () => {
  const [moodKey, setMoodKey] = useState<MoodKey>('night');
  const [windStrength, setWindStrength] = useState(1);
  const [gustSignal, setGustSignal] = useState(0);
  const [regatherSignal, setRegatherSignal] = useState(0);

  const mood = MOODS[moodKey];

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
          style={btnStyle(true)}
          onClick={() => setGustSignal((v) => v + 1)}
        >
          吹起一阵风
        </button>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => setRegatherSignal((v) => v + 1)}
        >
          重新凝聚
        </button>
        {(Object.keys(MOODS) as MoodKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={moodKey === key}
            style={btnStyle(moodKey === key)}
            onClick={() => setMoodKey(key)}
          >
            {MOODS[key].label}
          </button>
        ))}
        {[
          { label: '微风', value: 0.6 },
          { label: '清风', value: 1 },
          { label: '强风', value: 2 },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={windStrength === item.value}
            style={btnStyle(windStrength === item.value)}
            onClick={() => setWindStrength(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <DandelionField
        height={440}
        count={210}
        windStrength={windStrength}
        seedColor={mood.seedColor}
        accentColor={mood.accentColor}
        stemColor={mood.stemColor}
        gustSignal={gustSignal}
        regatherSignal={regatherSignal}
        style={{
          borderRadius: 'var(--aura-radius-lg)',
          background: mood.background,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            padding: '0 44px',
            textAlign: 'right',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: mood.titleColor,
              marginBottom: 10,
            }}
          >
            让灵感随风轻盈散开
          </div>
          <div
            style={{
              maxWidth: 320,
              fontSize: 13,
              lineHeight: 1.7,
              color: mood.descColor,
            }}
          >
            划过画布轻拂微风，点击任意位置即可掀起阵风吹散蒲公英绒毛；可直接作为
            Hero 首屏、登录页或引导页的 3D 氛围背景。
          </div>
        </div>
      </DandelionField>
    </div>
  );
};
