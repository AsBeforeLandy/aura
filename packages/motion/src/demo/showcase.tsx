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

/** 演示墙：8 个场景自动轮播，悬停暂停，点击圆点切换（深色科技舞台） */

const PALETTE = {
  bg: '#08090d',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.09)',
  text: '#f2f3f7',
  muted: 'rgba(255,255,255,0.48)',
  violet: 'linear-gradient(135deg,#6d28d9 0%,#a855f7 100%)',
  cyan: 'linear-gradient(135deg,#0891b2 0%,#22d3ee 100%)',
  blue: 'linear-gradient(135deg,#1d4ed8 0%,#60a5fa 100%)',
  fuchsia: 'linear-gradient(135deg,#a21caf 0%,#e879f9 100%)',
};

const glowCard: React.CSSProperties = {
  borderRadius: 12,
  color: '#fff',
  fontWeight: 500,
  fontSize: 14,
  padding: '14px 18px',
  boxShadow: '0 8px 24px -8px rgba(124,58,237,0.45)',
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
        <div style={{ ...glowCard, background: PALETTE.violet }}>
          Slide · 位移进场
        </div>
      </Slide>
      <Fade visible>
        <div style={{ ...glowCard, background: PALETTE.cyan }}>Fade · 淡入</div>
      </Fade>
      <Zoom visible>
        <div style={{ ...glowCard, background: PALETTE.blue }}>Zoom · 缩放</div>
      </Zoom>
      <Collapse open={open}>
        <div style={{ ...glowCard, background: PALETTE.fuchsia }}>
          Collapse · 展开
        </div>
      </Collapse>
    </div>
  );
}

function SceneReveal() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {['mask · 遮罩升起', 'blur · 对焦揭示', 'scale · 卡片长出'].map(
        (label, i) => (
          <Reveal
            key={label}
            variant={(['mask', 'blur', 'scale'] as const)[i]}
            index={i}
          >
            <div
              style={{
                ...glowCard,
                background: PALETTE.surface,
                border: `1px solid ${PALETTE.border}`,
                boxShadow: 'none',
              }}
            >
              {label}
            </div>
          </Reveal>
        ),
      )}
    </div>
  );
}

function SceneNumbers() {
  const gradientText: React.CSSProperties = {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    backgroundImage: 'linear-gradient(135deg,#a855f7,#22d3ee)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 32,
        alignItems: 'baseline',
        paddingTop: 8,
      }}
    >
      <div>
        <div style={{ color: PALETTE.muted, fontSize: 12, marginBottom: 4 }}>
          累计请求
        </div>
        <NumberTicker value={1289406} style={gradientText} />
      </div>
      <div>
        <div style={{ color: PALETTE.muted, fontSize: 12, marginBottom: 4 }}>
          成功率
        </div>
        <NumberTicker
          value={0.9856}
          format={(n) => `${(n * 100).toFixed(2)}%`}
          style={{ ...gradientText, fontSize: 30 }}
        />
      </div>
    </div>
  );
}

function SceneText() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <SplitText
        text="文字从遮罩里升起"
        granularity="char"
        variant="rise"
        stagger={0.05}
        style={{ fontSize: 26, fontWeight: 600, color: PALETTE.text }}
      />
      <SplitText
        text="FLIP IN MOTION"
        granularity="char"
        variant="flip"
        stagger={0.05}
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 3,
          color: '#a855f7',
          textShadow: '0 0 18px rgba(168,85,247,0.55)',
        }}
      />
    </div>
  );
}

function SceneAI() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>
        <TextShimmer duration={1.8}>正在为你生成季度报告…</TextShimmer>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TypingDots color="#a855f7" />
        <span style={{ fontSize: 13, color: PALETTE.muted }}>AI 正在思考</span>
      </div>
    </div>
  );
}

function SceneCard() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <GradientBorder
        radius={14}
        size={1.5}
        speed={4.5}
        colors={['#7c3aed', '#22d3ee', '#e879f9', '#7c3aed']}
        background="#0b0d13"
        style={{ flex: 1 }}
      >
        <div style={{ padding: 16 }}>
          <div
            style={{ fontWeight: 600, marginBottom: 4, color: PALETTE.text }}
          >
            流光边框
          </div>
          <div style={{ fontSize: 12, color: PALETTE.muted }}>
            光带沿边框游走
          </div>
        </div>
      </GradientBorder>
      <TiltCard maxTilt={7} style={{ flex: 1 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: 'linear-gradient(150deg,#171a24 0%,#0b0d13 100%)',
            border: `1px solid ${PALETTE.border}`,
            color: PALETTE.text,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>3D 倾斜</div>
          <div style={{ fontSize: 12, color: PALETTE.muted }}>
            移动鼠标体验光泽
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

function SceneAtmosphere() {
  return (
    <div style={{ position: 'relative' }}>
      <Aurora height={220} colors={['#7c3aed', '#22d3ee', '#e879f9']} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 4,
          textShadow: '0 0 28px rgba(168,85,247,0.65)',
        }}
      >
        AURA MOTION
      </div>
    </div>
  );
}

function SceneLoading() {
  return (
    <div style={{ display: 'grid', gap: 14, opacity: 0.9 }}>
      <SkeletonShimmer width="70%" height={18} index={0} />
      <SkeletonShimmer width="100%" height={14} index={1} />
      <SkeletonShimmer width="85%" height={14} index={2} />
      <Marquee duration={16} gap={24} style={{ marginTop: 8 }}>
        {['TOKENS', 'SYNTHETIC', 'MOTION', '2026'].map((t) => (
          <span
            key={t}
            style={{ fontSize: 13, letterSpacing: 3, color: PALETTE.muted }}
          >
            {t}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

const SCENES: {
  key: string;
  title: string;
  tag: string;
  render: () => React.ReactElement;
}[] = [
  {
    key: 'transitions',
    title: '进出场四件套',
    tag: 'Slide / Fade / Zoom / Collapse',
    render: () => <SceneTransitions />,
  },
  {
    key: 'reveal',
    title: '视口揭示的三种质感',
    tag: 'Reveal',
    render: () => <SceneReveal />,
  },
  {
    key: 'numbers',
    title: '逐位错峰的数字滚动',
    tag: 'NumberTicker',
    render: () => <SceneNumbers />,
  },
  {
    key: 'text',
    title: '文字的遮罩与翻牌入场',
    tag: 'SplitText',
    render: () => <SceneText />,
  },
  {
    key: 'ai',
    title: 'AI 生成中的质感',
    tag: 'TextShimmer / TypingDots',
    render: () => <SceneAI />,
  },
  {
    key: 'card',
    title: '卡片的流光与倾斜',
    tag: 'GradientBorder / TiltCard',
    render: () => <SceneCard />,
  },
  {
    key: 'atmosphere',
    title: '渐变氛围背景',
    tag: 'Aurora',
    render: () => <SceneAtmosphere />,
  },
  {
    key: 'loading',
    title: '加载与滚动',
    tag: 'SkeletonShimmer / Marquee',
    render: () => <SceneLoading />,
  },
];

export default () => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setCur((c) => (c + 1) % SCENES.length),
      3800,
    );
    return () => clearInterval(timer);
  }, [paused, cur]);

  const go = useCallback((i: number) => setCur(i), []);
  const scene = SCENES[cur];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 18,
        background: `radial-gradient(120% 90% at 15% -10%, rgba(124,58,237,0.22), transparent 55%),
                     radial-gradient(100% 80% at 100% 110%, rgba(34,211,238,0.14), transparent 55%),
                     ${PALETTE.bg}`,
        boxShadow:
          '0 24px 70px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px 22px 0',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: PALETTE.text }}>
            {scene.title}
          </div>
          <div
            style={{
              color: PALETTE.muted,
              fontSize: 12,
              marginTop: 3,
              letterSpacing: 0.3,
            }}
          >
            {scene.tag}
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          {paused ? '已暂停' : '自动轮播'}
        </div>
      </div>

      <div
        style={{
          height: 260,
          padding: 22,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          padding: '0 0 18px',
        }}
      >
        {SCENES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={s.title}
            onClick={() => go(i)}
            style={{
              width: i === cur ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: i === cur ? '#a855f7' : 'rgba(255,255,255,0.18)',
              boxShadow: i === cur ? '0 0 12px rgba(168,85,247,0.8)' : 'none',
              transition: 'all 260ms cubic-bezier(0.21, 0.47, 0.32, 0.98)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
