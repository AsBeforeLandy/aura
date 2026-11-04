import type { SceneNode } from './types';

/**
 * 场景 → Canvas 2D 绘制。
 *
 * 使用场景：单系列点数超过 `canvasThreshold`（默认 2000）时，
 * SVG 的 DOM 节点数会拖垮布局与重绘，切 Canvas 后只保留一次 draw call 批次。
 *
 * 注意：Canvas 里没有 DOM 节点，也就没有逐图元的事件与无障碍语义。
 * 因此启用 Canvas 时，图表仍会渲染一份**隐藏的无障碍数据表**（见 Chart 组件），
 * tooltip 也退化为按 x 轴索引命中，而非逐 mark 命中。
 */

export interface PaintOptions {
  /** 设备像素比，用于高清屏 */
  dpr?: number;
}

function applyPaint(
  ctx: CanvasRenderingContext2D,
  node: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    opacity?: number;
  },
) {
  ctx.fillStyle = node.fill ?? 'transparent';
  ctx.strokeStyle = node.stroke ?? 'transparent';
  ctx.lineWidth = node.strokeWidth ?? 1;
  ctx.globalAlpha = node.opacity ?? 1;
  if (node.strokeDasharray) {
    // "3 3" → [3, 3]
    const parts = node.strokeDasharray
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    ctx.setLineDash(parts);
  } else {
    ctx.setLineDash([]);
  }
}

function drawNodes(ctx: CanvasRenderingContext2D, nodes: readonly SceneNode[]) {
  for (const node of nodes) {
    switch (node.kind) {
      case 'group': {
        ctx.save();
        // group 的 transform 是 SVG 写法，这里只支持 translate(...)（当前图表未用到更复杂的）
        if (node.transform) {
          const matched = /translate\(\s*(-?[\d.]+)[,\s]+(-?[\d.]+)\s*\)/.exec(
            node.transform,
          );
          if (matched) ctx.translate(Number(matched[1]), Number(matched[2]));
        }
        drawNodes(ctx, node.children);
        ctx.restore();
        break;
      }
      case 'rect': {
        applyPaint(ctx, node);
        const radius = Math.min(
          node.radius ?? 0,
          Math.abs(node.width) / 2,
          Math.abs(node.height) / 2,
        );
        ctx.beginPath();
        if (radius > 0) {
          // roundRect 在部分旧环境不可用，手写等价路径
          const { x, y, width, height } = node;
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height,
          );
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        } else {
          ctx.rect(node.x, node.y, node.width, node.height);
        }
        if (node.fill && node.fill !== 'none') ctx.fill();
        if (node.stroke) ctx.stroke();
        break;
      }
      case 'path': {
        applyPaint(ctx, node);
        const path = new Path2D(node.d);
        if (node.fill && node.fill !== 'none') ctx.fill(path);
        if (node.stroke) ctx.stroke(path);
        break;
      }
      case 'circle': {
        applyPaint(ctx, node);
        ctx.beginPath();
        ctx.arc(node.cx, node.cy, Math.max(0, node.r), 0, Math.PI * 2);
        if (node.fill && node.fill !== 'none') ctx.fill();
        if (node.stroke) ctx.stroke();
        break;
      }
      case 'line': {
        applyPaint(ctx, node);
        ctx.beginPath();
        ctx.moveTo(node.x1, node.y1);
        ctx.lineTo(node.x2, node.y2);
        ctx.stroke();
        break;
      }
      case 'text': {
        applyPaint(ctx, { ...node, stroke: undefined });
        ctx.font = `${node.fontWeight ?? 400} ${node.fontSize ?? 12}px ${node.fontFamily ?? 'sans-serif'}`;
        ctx.textAlign =
          node.anchor === 'middle'
            ? 'center'
            : node.anchor === 'end'
              ? 'right'
              : 'left';
        ctx.textBaseline =
          node.baseline === 'middle'
            ? 'middle'
            : node.baseline === 'hanging'
              ? 'top'
              : 'alphabetic';
        if (node.rotate) {
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.rotate((node.rotate * Math.PI) / 180);
          ctx.fillText(node.text, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(node.text, node.x, node.y);
        }
        ctx.globalAlpha = 1;
        break;
      }
      default:
        break;
    }
  }
}

/** 把场景画到 canvas 上（会先清空并处理 DPR 缩放） */
export function paintScene(
  canvas: HTMLCanvasElement,
  nodes: readonly SceneNode[],
  options: PaintOptions = {},
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr =
    options.dpr ??
    (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;

  if (
    canvas.width !== Math.floor(width * dpr) ||
    canvas.height !== Math.floor(height * dpr)
  ) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  drawNodes(ctx, nodes);
}
