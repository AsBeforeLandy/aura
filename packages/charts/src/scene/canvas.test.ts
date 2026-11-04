import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paintScene } from './canvas';
import type { SceneNode } from './types';

const RECT = {
  width: 200,
  height: 100,
  top: 0,
  left: 0,
  right: 200,
  bottom: 100,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    RECT,
  );
});

/** 记录调用序列的最小 2D 上下文替身 */
function createContext() {
  const calls: string[] = [];
  const ctx = {
    calls,
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    sets: [] as string[],
    save: () => {
      calls.push('save');
    },
    restore: () => {
      calls.push('restore');
    },
    translate: () => {
      calls.push('translate');
    },
    rotate: () => {
      calls.push('rotate');
    },
    scale: () => {
      calls.push('scale');
    },
    beginPath: () => {
      calls.push('beginPath');
    },
    closePath: () => {
      calls.push('closePath');
    },
    moveTo: () => {
      calls.push('moveTo');
    },
    lineTo: () => {
      calls.push('lineTo');
    },
    quadraticCurveTo: () => {
      calls.push('quadraticCurveTo');
    },
    arc: () => {
      calls.push('arc');
    },
    rect: () => {
      calls.push('rect');
    },
    fill: () => {
      calls.push('fill');
    },
    stroke: () => {
      calls.push('stroke');
    },
    clearRect: () => {
      calls.push('clearRect');
    },
    setTransform: () => {
      calls.push('setTransform');
    },
    setLineDash: (dash: number[]) => {
      calls.push(`setLineDash:${dash.length}`);
    },
    fillText: (text: string) => {
      calls.push(`fillText:${text}`);
    },
  };
  return ctx;
}

function setup() {
  const ctx = createContext();
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  // jsdom 没有 Path2D
  vi.stubGlobal(
    'Path2D',
    class {
      constructor(public d: string) {}
    },
  );
  return { ctx, canvas };
}

describe('paintScene', () => {
  it('绘制所有图元类型', () => {
    const { ctx, canvas } = setup();

    const nodes: SceneNode[] = [
      { kind: 'line', key: 'l', x1: 0, y1: 0, x2: 10, y2: 10, stroke: '#000' },
      {
        kind: 'rect',
        key: 'r',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: '#f00',
      },
      {
        kind: 'rect',
        key: 'rr',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: '#f00',
        radius: 3,
        stroke: '#000',
      },
      { kind: 'circle', key: 'c', cx: 5, cy: 5, r: 3, fill: '#0f0' },
      {
        kind: 'path',
        key: 'p',
        d: 'M0,0L10,10',
        stroke: '#00f',
        strokeDasharray: '3 3',
      },
      {
        kind: 'text',
        key: 't',
        x: 0,
        y: 0,
        text: '标签',
        fill: '#333',
        rotate: -35,
      },
      {
        kind: 'group',
        key: 'g',
        transform: 'translate(5,5)',
        children: [
          { kind: 'circle', key: 'gc', cx: 1, cy: 1, r: 1, fill: '#000' },
        ],
      },
    ];

    paintScene(canvas, nodes);

    expect(ctx.calls).toContain('clearRect');
    expect(
      ctx.calls.filter((call) => call === 'stroke').length,
    ).toBeGreaterThan(0);
    expect(ctx.calls).toContain('fillText:标签');
    expect(ctx.calls).toContain('translate');
    expect(ctx.calls).toContain('rotate');
  });

  it('空场景只做清屏', () => {
    const { ctx, canvas } = setup();
    paintScene(canvas, []);
    expect(ctx.calls).toContain('clearRect');
    expect(ctx.calls).not.toContain('fill');
  });

  // 异常：拿不到 2D 上下文时安静退出，不抛错
  it('上下文不可用时不抛错', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);
    expect(() =>
      paintScene(canvas, [
        { kind: 'rect', key: 'r', x: 0, y: 0, width: 1, height: 1 },
      ]),
    ).not.toThrow();
  });

  // 边界：零尺寸图形不会被跳过（由 fill 兜底）
  it('零尺寸矩形仍走绘制流程', () => {
    const { ctx, canvas } = setup();
    paintScene(canvas, [
      { kind: 'rect', key: 'r', x: 0, y: 0, width: 0, height: 0, fill: '#000' },
    ]);
    expect(ctx.calls).toContain('fill');
  });
});
