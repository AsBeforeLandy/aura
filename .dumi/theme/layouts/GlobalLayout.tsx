import React, { useEffect, useRef } from 'react';
// @ts-ignore — dumi 运行时导出了这些 hooks，但 .d.ts 类型声明不完整
import { useOutlet, usePrefersColor } from 'dumi';

// ===== 蒲公英粒子物理背景（柔美写意版）=====
interface Seed {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  rotation: number;
  rotSpeed: number;
  wobblePhase: number;
  wobbleFreq: number;
  scale: number;        // 每颗种子大小不同
  alpha: number;
  swayPhase: number;    // 左右摇曳相位
  swayAmp: number;      // 摇曳幅度
  driftPhase: number;   // 呼吸式浮沉
}

const DandelionCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const seeds: Seed[] = [];
    const count = 18;
    const mouse = { x: -9999, y: -9999 };
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // 初始化——每颗种子有独特的大小、速度、摇曳频率
    for (let i = 0; i < count; i++) {
      const bvx = -0.12 - Math.random() * 0.28;
      const bvy = -0.08 - Math.random() * 0.22;
      seeds.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: bvx, vy: bvy, baseVx: bvx, baseVy: bvy,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.006,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleFreq: 0.003 + Math.random() * 0.008,
        scale: 1.2 + Math.random() * 1.2,     // 1.2x ~ 2.4x 整体放大
        alpha: 0.3 + Math.random() * 0.35,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.3 + Math.random() * 0.5,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }

    // 绘制单颗柔美蒲公英种子
    const drawSeed = (s: Seed, rgb: string) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.scale(s.scale, s.scale);
      ctx.globalAlpha = s.alpha;

      // --- A. 底部种子体：小水滴形 ---
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.quadraticCurveTo(-2.5, 16, 0, 12);
      ctx.quadraticCurveTo(2.5, 16, 0, 20);
      ctx.fillStyle = `rgba(${rgb}, 0.55)`;
      ctx.fill();

      // --- B. 细茎：从种子体顶部到伞冠中心 ---
      const stemBend = Math.sin(time * 0.7 + s.wobblePhase) * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.quadraticCurveTo(stemBend, 4, 0, 0);
      ctx.strokeStyle = `rgba(${rgb}, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // --- C. 伞冠绒球：从原点(0,0)向上方半球放射大量绒丝 ---
      const filamentCount = 20;
      for (let i = 0; i < filamentCount; i++) {
        // 绒丝在上半球均匀分布（-π 到 0 的扇形范围）
        const spreadAngle = -Math.PI + (i / (filamentCount - 1)) * Math.PI;
        // 每根绒丝独立的微颤
        const tremor = Math.sin(time * 1.5 + s.wobblePhase + i * 0.9) * 0.06;
        const angle = spreadAngle + tremor;

        // 长度有随机差异，中间的更长，两侧略短，像真正的球状伞
        const centerFactor = 1 - Math.abs(i - (filamentCount - 1) / 2) / ((filamentCount - 1) / 2);
        const len = 10 + centerFactor * 8 + Math.sin(i * 2.3) * 2;

        const ex = Math.cos(angle) * len;
        const ey = Math.sin(angle) * len;

        // 贝塞尔控制点使绒丝向外微弯（不是直线）
        const bulge = 0.6 + centerFactor * 0.15;
        const cx = Math.cos(angle) * len * bulge + Math.sin(time * 0.5 + i) * 1.2;
        const cy = Math.sin(angle) * len * bulge;

        // 画一根绒丝
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.strokeStyle = `rgba(${rgb}, ${0.15 + centerFactor * 0.12})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();

        // 绒丝末端的微小分叉（2~3 根短须）
        const forkCount = 2 + (i % 2);
        for (let f = 0; f < forkCount; f++) {
          const forkAngle = angle + (f - (forkCount - 1) / 2) * 0.35;
          const forkLen = 2.5 + ((i * 7 + f * 3) % 5) * 0.3;
          const fx = ex + Math.cos(forkAngle) * forkLen;
          const fy = ey + Math.sin(forkAngle) * forkLen;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(fx, fy);
          ctx.strokeStyle = `rgba(${rgb}, 0.12)`;
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }

        // 绒丝尖端柔光点
        ctx.beginPath();
        ctx.arc(ex, ey, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.25)`;
        ctx.fill();
      }

      // --- D. 伞冠中心的小绒球聚合点 ---
      const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
      centerGlow.addColorStop(0, `rgba(${rgb}, 0.5)`);
      centerGlow.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.restore();
    };


    // 滚动速度追踪
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let scrollDecay = 0; // 滚动停止后的衰减惯性

    // 动画主循环
    const loop = () => {
      time += 0.016;
      const cw = W();
      const ch = H();
      ctx.clearRect(0, 0, cw, ch);

      // 计算当前帧的滚动速度
      const currentScrollY = window.scrollY;
      const rawDelta = currentScrollY - lastScrollY;
      scrollVelocity = rawDelta;
      lastScrollY = currentScrollY;

      // 滚动惯性衰减（滚动停止后仍保持一段气流）
      if (Math.abs(rawDelta) > 0.5) {
        scrollDecay = rawDelta * 0.8;
      } else {
        scrollDecay *= 0.92; // 缓慢衰减
      }
      const windForce = scrollVelocity + scrollDecay;

      const isDark = document.documentElement.getAttribute('data-prefers-color') === 'dark';
      const rgb = isDark ? '196, 181, 253' : '140, 90, 230';

      // --- 粒子间连锁效应（距离近的粒子互相传递动能）---
      if (Math.abs(windForce) > 1) {
        for (let i = 0; i < seeds.length; i++) {
          for (let j = i + 1; j < seeds.length; j++) {
            const dx = seeds[j].x - seeds[i].x;
            const dy = seeds[j].y - seeds[i].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const chainRadius = 120;
            if (d < chainRadius && d > 0) {
              const influence = ((chainRadius - d) / chainRadius) * 0.15;
              // 互相传递水平扰动
              const avgVx = (seeds[i].vx + seeds[j].vx) * 0.5;
              seeds[i].vx += (avgVx - seeds[i].vx) * influence;
              seeds[j].vx += (avgVx - seeds[j].vx) * influence;
              // 互相传递垂直扰动
              const avgVy = (seeds[i].vy + seeds[j].vy) * 0.5;
              seeds[i].vy += (avgVy - seeds[i].vy) * influence;
              seeds[j].vy += (avgVy - seeds[j].vy) * influence;
            }
          }
        }
      }

      seeds.forEach((s, idx) => {
        // 1. 鼠标排斥
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const f = (150 - dist) / 150;
          s.vx += (dx / dist) * f * 1.0;
          s.vy += (dy / dist) * f * 1.0;
        } else {
          s.vx += (s.baseVx - s.vx) * 0.012;
          s.vy += (s.baseVy - s.vy) * 0.012;
        }

        // 2. 滚动气流：修正为反方向相对运动，并大幅调小系数使移动更加柔和
        if (Math.abs(windForce) > 0.5) {
          // 不同粒子受到的气流有延迟差异（连锁波浪感）
          const delay = Math.sin(idx * 0.8 + time * 3) * 0.3 + 0.7;
          // 向下滚动时 (windForce > 0)，粒子应该向上飘 (vy 变小)
          s.vy -= windForce * 0.02 * delay;
          // 气流也带来轻微的水平散开力
          s.vx += Math.sin(time * 2 + idx * 1.3) * Math.abs(windForce) * 0.008;
          // 气流加速旋转
          s.rotation -= windForce * 0.0015 * delay;
        }

        // 3. 空气阻力
        s.vx *= 0.975;
        s.vy *= 0.975;

        // 4. 正弦摇曳（水平左右轻荡）
        s.swayPhase += 0.012;
        s.x += s.vx + Math.sin(s.swayPhase) * s.swayAmp * 0.3;

        // 5. 呼吸式浮沉（垂直方向微微起伏）
        s.driftPhase += 0.008;
        s.y += s.vy + Math.sin(s.driftPhase) * 0.15;

        // 6. 旋转
        s.rotation += s.rotSpeed + Math.sin(s.wobblePhase) * 0.003;
        s.wobblePhase += s.wobbleFreq;

        // 7. 边缘循环
        if (s.y < -40) { s.y = ch + 30; s.x = Math.random() * cw; }
        if (s.x < -40) { s.x = cw + 30; s.y = Math.random() * ch; }
        if (s.x > cw + 40) { s.x = -30; s.y = Math.random() * ch; }
        if (s.y > ch + 40) { s.y = -30; s.x = Math.random() * cw; }

        drawSeed(s, rgb);
      });

      raf = requestAnimationFrame(loop);
    };
    loop();

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};

// ===== 全局布局组件 =====
const GlobalLayout: React.FC = () => {
  const outlet = useOutlet();
  const [color] = usePrefersColor();

  // 仅在首页显示蒲公英背景
  const isHome = typeof window !== 'undefined'
    && (window.location.pathname === '/' || window.location.pathname === '/aura' || window.location.pathname === '/aura/');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', color || 'light');
  }, [color]);

  return (
    <>
      {isHome && <DandelionCanvas />}
      {outlet}
    </>
  );
};

export default GlobalLayout;
