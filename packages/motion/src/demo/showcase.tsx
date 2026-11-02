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
  bg: 'var(--demo-stage-bg)',
  surface: 'var(--demo-surface)',
  border: 'var(--demo-border)',
  text: 'var(--demo-text)',
  muted: 'var(--demo-muted)',
  violet: 'var(--demo-violet)',
  cyan: 'var(--demo-cyan)',
  blue: 'var(--demo-blue)',
  fuchsia: 'var(--demo-fuchsia)',
};

/** 舞台光斑（亮/暗各一套，定义见 .dumi/global.css 的 --demo-*） */
const STAGE_GLOW =
  'radial-gradient(120% 90% at 15% -10%, var(--demo-stage-glow-a), transparent 55%), radial-gradient(100% 80% at 100% 110%, var(--demo-stage-glow-b), transparent 55%), var(--demo-stage-bg)';

/** 渐变卡：底色饱和，统一用白字（亮/暗主题下都可读） */
const glowCard: React.CSSProperties = {
  borderRadius: 12,
  color: '#fff',
  fontWeight: 500,
  fontSize: 14,
  padding: '14px 18px',
  boxShadow: 'var(--demo-glow)',
};

/** 表面卡：底色随主题（亮 = 白 / 暗 = 半透明白），文字必须用主题文字色 */
const surfaceCard: React.CSSProperties = {
  borderRadius: 12,
  color: 'var(--demo-text)',
  fontWeight: 500,
  fontSize: 14,
  padding: '14px 18px',
  background: 'var(--demo-surface)',
  border: '1px solid var(--demo-border)',
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
            <div style={surfaceCard}>{label}</div>
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
    backgroundImage:
      'linear-gradient(135deg, var(--demo-num-from), var(--demo-num-to))',
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
          color: 'var(--demo-dot-active)',
          textShadow: '0 0 18px rgba(168,85,247,0.55)',
        }}
      />
    </div>
  );
}

function SceneAI() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        padding: 18,
        borderRadius: 14,
        background: 'var(--aura-motion-card-bg, #ffffff)',
        border: `1px solid ${PALETTE.border}`,
        color: 'var(--demo-text)',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600 }}>
        <TextShimmer duration={1.8}>正在为你生成季度报告…</TextShimmer>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TypingDots color="var(--demo-dot-active)" />
        <span style={{ fontSize: 13, color: 'var(--demo-muted)' }}>
          AI 正在思考
        </span>
      </div>
    </div>
  );
}

function SceneCard() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <GradientBorder
        radius={14}
        size={2.5}
        speed={4.5}
        colors={[
          'var(--demo-num-from)',
          'var(--demo-num-to)',
          'var(--demo-dot-active)',
        ]}
        style={{ flex: 1 }}
      >
        <div style={{ padding: 16 }}>
          <div
            style={{
              fontWeight: 600,
              marginBottom: 4,
              color: 'var(--demo-text)',
            }}
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
            background: 'var(--aura-motion-card-bg, #ffffff)',
            border: `1px solid ${PALETTE.border}`,
            color: 'var(--demo-text)',
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
      <Aurora
        height={220}
        colors={[
          'var(--demo-num-from)',
          'var(--demo-num-to)',
          'var(--demo-dot-active)',
        ]}
      />
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
        background: STAGE_GLOW,
        boxShadow: 'var(--demo-stage-shadow)',
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
              background:
                i === cur ? 'var(--demo-dot-active)' : 'var(--demo-dot)',
              boxShadow: i === cur ? 'var(--demo-dot-glow)' : 'none',
              transition: 'all 260ms cubic-bezier(0.21, 0.47, 0.32, 0.98)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
