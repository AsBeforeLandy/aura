import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from '@aura-react-comp/motion';
import {
  Aurora,
  Collapse,
  Fade,
  GradientBorder,
  Marquee,
  NumberTicker,
  Reveal,
  SkeletonShimmer,
  Slide,
  SplitText,
  TextShimmer,
  TiltCard,
  TypingDots,
  Zoom,
} from '@aura-react-comp/motion';

/** 演示墙：8 个场景自动轮播，悬停暂停，点击圆点切换 */

const card: React.CSSProperties = {
  padding: '14px 18px',
  borderRadius: 12,
  color: '#fff',
  fontWeight: 500,
  fontSize: 14,
};

function SceneTransitions() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 1700);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Slide visible direction="up">
        <div style={{ ...card, background: 'linear-gradient(135deg,#534ab7,#7f77dd)' }}>
          Slide 位移进场
        </div>
      </Slide>
      <Fade visible>
        <div style={{ ...card, background: 'linear-gradient(135deg,#0f6e56,#1d9e75)' }}>
          Fade 淡入
        </div>
      </Fade>
      <Zoom visible>
        <div style={{ ...card, background: 'linear-gradient(135deg,#185fa5,#378add)' }}>
          Zoom 缩放
        </div>
      </Zoom>
      <Collapse open={open}>
        <div style={{ ...card, background: 'linear-gradient(135deg,#ba7517,#d4922a)' }}>
          Collapse 高度展开
        </div>
      </Collapse>
    </div>
  );
}

function SceneReveal() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {['mask 遮罩升起', 'blur 对焦揭示', 'scale 卡片长出'].map((label, i) => (
        <Reveal key={label} variant={(['mask', 'blur', 'scale'] as const)[i]} index={i}>
          <div style={{ ...card, background: 'linear-gradient(135deg,#2b2a33,#43414d)' }}>
            {label}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function SceneNumbers() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', paddingTop: 12 }}>
      <div>
        <div style={{ color: '#8a8984', fontSize: 12, marginBottom: 4 }}>累计请求</div>
        <NumberTicker value={1289406} style={{ fontSize: 34, fontWeight: 600 }} />
      </div>
      <div>
        <div style={{ color: '#8a8984', fontSize: 12, marginBottom: 4 }}>成功率</div>
        <NumberTicker
          value={0.9856}
          format={(n) => `${(n * 100).toFixed(2)}%`}
          style={{ fontSize: 34, fontWeight: 600 }}
        />
      </div>
    </div>
  );
}

function SceneText() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <SplitText
        text="文字从遮罩里升起"
        granularity="char"
        variant="rise"
        stagger={0.05}
        style={{ fontSize: 26, fontWeight: 600 }}
      />
      <SplitText
        text="FLIP IN MOTION"
        granularity="char"
        variant="flip"
        stagger={0.05}
        style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2, color: '#534ab7' }}
      />
    </div>
  );
}

function SceneAI() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#534ab7' }}>
        <TextShimmer duration={1.8} highlightColor="rgba(0,0,0,0.45)">
          正在为你生成季度报告…
        </TextShimmer>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#534ab7' }}>
        <TypingDots />
        <span style={{ fontSize: 13, color: '#8a8984' }}>AI 正在思考</span>
      </div>
    </div>
  );
}

function SceneCard() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <GradientBorder radius={14} size={1.5} style={{ flex: 1 }}>
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>流光边框</div>
          <div style={{ fontSize: 12, color: '#8a8984' }}>光带沿边框游走</div>
        </div>
      </GradientBorder>
      <TiltCard maxTilt={7} style={{ flex: 1 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: 'linear-gradient(145deg,#2b2a33,#1a1a1f)',
            color: '#fff',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>3D 倾斜</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>移动鼠标体验光泽</div>
        </div>
      </TiltCard>
    </div>
  );
}

function SceneAtmosphere() {
  return (
    <div style={{ position: 'relative' }}>
      <Aurora height={220} colors={['#534ab7', '#1d9e75', '#378add']} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1,
          textShadow: '0 2px 12px rgba(0,0,0,0.35)',
        }}
      >
        AURA MOTION
      </div>
    </div>
  );
}

function SceneLoading() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <SkeletonShimmer width="70%" height={18} index={0} />
      <SkeletonShimmer width="100%" height={14} index={1} />
      <SkeletonShimmer width="85%" height={14} index={2} />
      <Marquee duration={16} gap={24} style={{ marginTop: 8 }}>
        {['TOKENS', 'SYNTHETIC', 'MOTION', '2026'].map((t) => (
          <span key={t} style={{ fontSize: 13, letterSpacing: 2, color: '#8a8984' }}>
            {t}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

const SCENES: { key: string; title: string; tag: string; render: () => React.ReactElement }[] = [
  { key: 'transitions', title: '进出场四件套', tag: 'Slide / Fade / Zoom / Collapse', render: () => <SceneTransitions /> },
  { key: 'reveal', title: '视口揭示的三种质感', tag: 'Reveal', render: () => <SceneReveal /> },
  { key: 'numbers', title: '逐位错峰的数字滚动', tag: 'NumberTicker', render: () => <SceneNumbers /> },
  { key: 'text', title: '文字的遮罩与翻牌入场', tag: 'SplitText', render: () => <SceneText /> },
  { key: 'ai', title: 'AI 生成中的质感', tag: 'TextShimmer / TypingDots', render: () => <SceneAI /> },
  { key: 'card', title: '卡片的流光与倾斜', tag: 'GradientBorder / TiltCard', render: () => <SceneCard /> },
  { key: 'atmosphere', title: '渐变氛围背景', tag: 'Aurora', render: () => <SceneAtmosphere /> },
  { key: 'loading', title: '加载与滚动', tag: 'SkeletonShimmer / Marquee', render: () => <SceneLoading /> },
];

export default () => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setCur((c) => (c + 1) % SCENES.length), 3800);
    return () => clearInterval(timer);
  }, [paused, cur]);

  const go = useCallback((i: number) => setCur(i), []);
  const scene = SCENES[cur];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        border: '1px solid #e8e6de',
        borderRadius: 16,
        background: '#faf9f5',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px 0' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{scene.title}</div>
          <div style={{ color: '#8a8984', fontSize: 12, marginTop: 2 }}>{scene.tag}</div>
        </div>
        <div style={{ color: '#b4b2a9', fontSize: 12 }}>{paused ? '已暂停' : '自动轮播'}</div>
      </div>

      <div style={{ height: 260, padding: 20, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {scene.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '0 0 16px' }}>
        {SCENES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={s.title}
            onClick={() => go(i)}
            style={{
              width: i === cur ? 22 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: i === cur ? '#534ab7' : '#d3d1c7',
              transition: 'all 260ms cubic-bezier(0.21, 0.47, 0.32, 0.98)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
