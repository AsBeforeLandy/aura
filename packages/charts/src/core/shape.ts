/**
 * 路径生成器。
 *
 * 所有图表最终都落到「一段 SVG path 字符串」这一层：
 *   · SVG 渲染器把它直接写进 `<path d>`；
 *   · Canvas 渲染器把它交给 `new Path2D(d)`。
 * 两条渲染路径共用同一份几何计算，因此不存在「SVG 与 Canvas 画得不一样」的问题。
 */

export interface Point {
  x: number;
  y: number;
}

export type CurveType = 'linear' | 'smooth' | 'monotone' | 'step';

/** 曲线上的点允许为 null，表示此处数据缺失、路径应断开 */
export type CurvePoint = Point | null;

const f = (value: number): string =>
  Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '0';

/** 把点序列拆成若干连续段，段与段之间是 null 造成的断点 */
export function splitSegments(points: readonly CurvePoint[]): Point[][] {
  const segments: Point[][] = [];
  let current: Point[] = [];
  for (const point of points) {
    if (point) current.push(point);
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

/**
 * Fritsch–Carlson 单调切线。
 *
 * 目的：让平滑折线在数据极值处不「鼓包」。
 * 普通 Catmull-Rom 会让曲线冲出数据范围（视觉上像在说谎），
 * 折线图必须避免这种失真，因此默认曲线类型用的是 monotone。
 */
function monotoneTangents(xs: number[], ys: number[]): number[] {
  const n = xs.length;
  if (n < 2) return [0];

  const dx: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const deltaX = xs[i + 1] - xs[i];
    dx.push(deltaX);
    slopes.push(deltaX === 0 ? 0 : (ys[i + 1] - ys[i]) / deltaX);
  }

  const m = new Array<number>(n);
  m[0] = slopes[0];
  m[n - 1] = slopes[n - 2];

  for (let i = 1; i < n - 1; i += 1) {
    const s0 = slopes[i - 1];
    const s1 = slopes[i];
    if (s0 * s1 <= 0) {
      m[i] = 0; // 极值点或平段：切线归零，曲线不会越界
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / s0 + w2 / s1);
    }
  }
  return m;
}

/** 单个点序列 → path 命令（不含 M 之外的前缀处理） */
function segmentToPath(points: Point[], curve: CurveType): string {
  if (points.length === 1) {
    // 单点也要能画出来（否则只剩一个孤立 symbol，连线消失）
    const { x, y } = points[0];
    return `M${f(x)},${f(y)}L${f(x)},${f(y)}`;
  }

  if (curve === 'linear') {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p.x)},${f(p.y)}`)
      .join('');
  }

  if (curve === 'step') {
    let d = `M${f(points[0].x)},${f(points[0].y)}`;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      d += `H${f(midX)}V${f(curr.y)}H${f(curr.x)}`;
    }
    return d;
  }

  // smooth / monotone 都走三次贝塞尔，区别在于切线算法
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const tangents = monotoneTangents(xs, ys);

  let d = `M${f(points[0].x)},${f(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = (p1.x - p0.x) / 3;

    // smooth 在单调切线基础上放大 20%，视觉更「圆润」但仍不越界
    const grow = curve === 'smooth' ? 1.2 : 1;
    const c1x = p0.x + dx;
    const c1y = p0.y + tangents[i] * dx * grow;
    const c2x = p1.x - dx;
    const c2y = p1.y - tangents[i + 1] * dx * grow;

    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p1.x)},${f(p1.y)}`;
  }
  return d;
}

/** 折线路径（自动处理 null 断点） */
export function linePath(
  points: readonly CurvePoint[],
  curve: CurveType = 'monotone',
): string {
  return splitSegments(points)
    .map((segment) => segmentToPath(segment, curve))
    .filter(Boolean)
    .join('');
}

/**
 * 面积路径：上边界沿曲线走，再沿基线折回。
 *
 * @param points   上边界点集
 * @param baseline 基线像素 y（通常是 0 值所在位置）
 */
export function areaPath(
  points: readonly CurvePoint[],
  baseline: number,
  curve: CurveType = 'monotone',
): string {
  return splitSegments(points)
    .map((segment) => {
      if (segment.length === 0) return '';
      const top = segmentToPath(segment, curve);
      const last = segment[segment.length - 1];
      const first = segment[0];
      return `${top}L${f(last.x)},${f(baseline)}L${f(first.x)},${f(baseline)}Z`;
    })
    .filter(Boolean)
    .join('');
}

/**
 * 扇形路径（饼图 / 环图 / 玫瑰图）。
 *
 * @param cx 圆心 x
 * @param cy 圆心 y
 * @param innerRadius 内半径，大于 0 即为环形
 * @param outerRadius 外半径
 * @param startAngle 起始角（弧度，0 指向 3 点钟方向，顺时针为正）
 * @param endAngle 结束角
 */
export function arcPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  // 整圆无法用单段 A 命令表达（起终点重合），拆成两个半圆
  if (Math.abs(sweep) >= Math.PI * 2 - 1e-6) {
    return [
      `M${f(cx - outerRadius)},${f(cy)}`,
      `A${f(outerRadius)},${f(outerRadius)} 0 1 1 ${f(cx + outerRadius)},${f(cy)}`,
      `A${f(outerRadius)},${f(outerRadius)} 0 1 1 ${f(cx - outerRadius)},${f(cy)}`,
      innerRadius > 0
        ? `M${f(cx - innerRadius)},${f(cy)}A${f(innerRadius)},${f(innerRadius)} 0 1 0 ${f(cx + innerRadius)},${f(cy)}A${f(innerRadius)},${f(innerRadius)} 0 1 0 ${f(cx - innerRadius)},${f(cy)}`
        : '',
      'Z',
    ].join('');
  }

  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
  const direction = sweep > 0 ? 1 : 0;

  const x0 = cx + outerRadius * Math.cos(startAngle);
  const y0 = cy + outerRadius * Math.sin(startAngle);
  const x1 = cx + outerRadius * Math.cos(endAngle);
  const y1 = cy + outerRadius * Math.sin(endAngle);

  if (innerRadius <= 0) {
    return `M${f(cx)},${f(cy)}L${f(x0)},${f(y0)}A${f(outerRadius)},${f(outerRadius)} 0 ${largeArc} ${direction} ${f(x1)},${f(y1)}Z`;
  }

  const ix1 = cx + innerRadius * Math.cos(endAngle);
  const iy1 = cy + innerRadius * Math.sin(endAngle);
  const ix0 = cx + innerRadius * Math.cos(startAngle);
  const iy0 = cy + innerRadius * Math.sin(startAngle);

  return [
    `M${f(x0)},${f(y0)}`,
    `A${f(outerRadius)},${f(outerRadius)} 0 ${largeArc} ${direction} ${f(x1)},${f(y1)}`,
    `L${f(ix1)},${f(iy1)}`,
    `A${f(innerRadius)},${f(innerRadius)} 0 ${largeArc} ${direction === 1 ? 0 : 1} ${f(ix0)},${f(iy0)}`,
    'Z',
  ].join('');
}

/**
 * 圆角矩形路径。
 *
 * 柱状图的圆角通常只在上方两个角（负值柱则在下两个角），
 * 因此用 corners 精确控制，而不是简单给 rect 加 rx（那会四角全圆）。
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  corners: { tl?: boolean; tr?: boolean; br?: boolean; bl?: boolean } = {
    tl: true,
    tr: true,
  },
): string {
  const r = Math.max(
    0,
    Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2),
  );
  if (r === 0)
    return `M${f(x)},${f(y)}H${f(x + width)}V${f(y + height)}H${f(x)}Z`;

  const { tl = true, tr = true, br = false, bl = false } = corners;
  const rtl = tl ? r : 0;
  const rtr = tr ? r : 0;
  const rbr = br ? r : 0;
  const rbl = bl ? r : 0;

  const x1 = x + width;
  const y1 = y + height;

  return [
    `M${f(x + rtl)},${f(y)}`,
    `H${f(x1 - rtr)}`,
    rtr ? `A${f(rtr)},${f(rtr)} 0 0 1 ${f(x1)},${f(y + rtr)}` : '',
    `V${f(y1 - rbr)}`,
    rbr ? `A${f(rbr)},${f(rbr)} 0 0 1 ${f(x1 - rbr)},${f(y1)}` : '',
    `H${f(x + rbl)}`,
    rbl ? `A${f(rbl)},${f(rbl)} 0 0 1 ${f(x)},${f(y1 - rbl)}` : '',
    `V${f(y + rtl)}`,
    rtl ? `A${f(rtl)},${f(rtl)} 0 0 1 ${f(x + rtl)},${f(y)}` : '',
    'Z',
  ].join('');
}

/** 散点图形符号 */
export type SymbolType =
  'circle' | 'square' | 'diamond' | 'triangle' | 'star' | 'cross';

export function symbolPath(
  type: SymbolType,
  cx: number,
  cy: number,
  size: number,
): string {
  const s = size / 2;
  switch (type) {
    case 'square':
      return `M${f(cx - s)},${f(cy - s)}H${f(cx + s)}V${f(cy + s)}H${f(cx - s)}Z`;
    case 'diamond':
      return `M${f(cx)},${f(cy - s)}L${f(cx + s)},${f(cy)}L${f(cx)},${f(cy + s)}L${f(cx - s)},${f(cy)}Z`;
    case 'triangle':
      return `M${f(cx)},${f(cy - s)}L${f(cx + s)},${f(cy + s)}L${f(cx - s)},${f(cy + s)}Z`;
    case 'cross': {
      const t = s / 3;
      return [
        `M${f(cx - s)},${f(cy - t)}H${f(cx - t)}V${f(cy - s)}H${f(cx + t)}V${f(cy - t)}`,
        `H${f(cx + s)}V${f(cy + t)}H${f(cx + t)}V${f(cy + s)}H${f(cx - t)}V${f(cy + t)}H${f(cx - s)}Z`,
      ].join('');
    }
    case 'star': {
      const points: string[] = [];
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 === 0 ? s : s * 0.45;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        points.push(
          `${f(cx + radius * Math.cos(angle))},${f(cy + radius * Math.sin(angle))}`,
        );
      }
      return `M${points.join('L')}Z`;
    }
    case 'circle':
    default: {
      // 用两段圆弧表达圆形，保证与 rect/path 渲染器行为一致
      return `M${f(cx - s)},${f(cy)}A${f(s)},${f(s)} 0 1 0 ${f(cx + s)},${f(cy)}A${f(s)},${f(s)} 0 1 0 ${f(cx - s)},${f(cy)}Z`;
    }
  }
}

/**
 * 圆弧中心线路径。
 *
 * 与 arcPath 的区别：arcPath 生成的是「环带 + 填充」的闭合区域，
 * 而这里只生成一条中心线圆弧，供 stroke 使用（仪表盘、进度环都用它）。
 */
export function arcLinePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (Math.abs(sweep) < 1e-6 || radius <= 0) return '';

  // 整圆无法用单段弧表达，拆成两段
  if (Math.abs(sweep) >= Math.PI * 2 - 1e-6) {
    const x = cx + radius * Math.cos(startAngle);
    const y = cy + radius * Math.sin(startAngle);
    return `M${f(x)},${f(y)}A${f(radius)},${f(radius)} 0 1 1 ${f(cx - (x - cx))},${f(cy - (y - cy))}A${f(radius)},${f(radius)} 0 1 1 ${f(x)},${f(y)}`;
  }

  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;
  const direction = sweep > 0 ? 1 : 0;
  const x0 = cx + radius * Math.cos(startAngle);
  const y0 = cy + radius * Math.sin(startAngle);
  const x1 = cx + radius * Math.cos(endAngle);
  const y1 = cy + radius * Math.sin(endAngle);

  return `M${f(x0)},${f(y0)}A${f(radius)},${f(radius)} 0 ${largeArc} ${direction} ${f(x1)},${f(y1)}`;
}
