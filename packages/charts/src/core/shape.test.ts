import { describe, it, expect } from 'vitest';
import {
  arcPath,
  areaPath,
  linePath,
  roundedRectPath,
  splitSegments,
  symbolPath,
} from './shape';

describe('splitSegments', () => {
  it('按 null 断点拆段', () => {
    const segments = splitSegments([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      null,
      { x: 2, y: 2 },
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveLength(2);
    expect(segments[1]).toHaveLength(1);
  });

  // 异常：全为 null 时不应产生空段
  it('全 null 返回空数组', () => {
    expect(splitSegments([null, null])).toEqual([]);
  });

  // 边界：空数组
  it('空数组返回空数组', () => {
    expect(splitSegments([])).toEqual([]);
  });
});

describe('linePath', () => {
  it('线性路径以 M 开头并逐点 L', () => {
    const d = linePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
      ],
      'linear',
    );
    expect(d.startsWith('M')).toBe(true);
    expect(d).toContain('L');
  });

  it('平滑曲线使用三次贝塞尔', () => {
    const d = linePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 },
      ],
      'monotone',
    );
    expect(d).toContain('C');
  });

  it('阶梯曲线产生 H / V 指令', () => {
    const d = linePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      'step',
    );
    expect(d).toContain('H');
    expect(d).toContain('V');
  });

  // 边界：单点也要能画出路径（否则孤立点会消失）
  it('单点生成退化路径', () => {
    const d = linePath([{ x: 5, y: 5 }]);
    expect(d).toBe('M5,5L5,5');
  });

  // 异常：全 null 返回空字符串
  it('全 null 返回空字符串', () => {
    expect(linePath([null, null])).toBe('');
  });

  // 白盒：单调插值不应在极值处越界（y 值不应小于 min 或大于 max）
  it('monotone 曲线控制点不越出数据范围', () => {
    const d = linePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 100 },
        { x: 20, y: 0 },
      ],
      'monotone',
    );
    const numbers = d
      .replace(/[MCLH VZ]/g, ' ')
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const ys = numbers.filter((_, index) => index % 2 === 1);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1);
    expect(Math.max(...ys)).toBeLessThanOrEqual(101);
  });
});

describe('areaPath', () => {
  it('路径闭合到基线', () => {
    const d = areaPath(
      [
        { x: 0, y: 10 },
        { x: 10, y: 20 },
      ],
      50,
    );
    expect(d).toContain('L0,50');
    expect(d.endsWith('Z')).toBe(true);
  });
});

describe('arcPath', () => {
  it('普通扇形使用 A 指令', () => {
    const d = arcPath(50, 50, 0, 40, 0, Math.PI / 2);
    expect(d).toContain('A');
    expect(d.endsWith('Z')).toBe(true);
  });

  it('环形扇区包含内外两段弧', () => {
    const d = arcPath(50, 50, 20, 40, 0, Math.PI / 2);
    expect((d.match(/A/g) ?? []).length).toBe(2);
  });

  // 边界：整圆无法用单段弧表达，需拆成两段
  it('整圆拆成两段弧', () => {
    const d = arcPath(50, 50, 0, 40, 0, Math.PI * 2);
    expect((d.match(/A/g) ?? []).length).toBe(2);
  });

  // 边界：零角度扇形仍返回合法路径（不抛错）
  it('零角度返回合法路径', () => {
    const d = arcPath(50, 50, 0, 40, 1, 1);
    expect(d.startsWith('M')).toBe(true);
    expect(d).not.toContain('NaN');
  });
});

describe('roundedRectPath', () => {
  it('只在指定角上加圆角', () => {
    const d = roundedRectPath(0, 0, 100, 50, 8, { tl: true, tr: true });
    expect((d.match(/A/g) ?? []).length).toBe(2);
  });

  // 边界：半径超过尺寸时被钳制，不产生自交路径
  it('半径过大时钳制到一半尺寸', () => {
    const d = roundedRectPath(0, 0, 10, 10, 999);
    expect(d).not.toContain('NaN');
    expect(d).toContain('5');
  });

  it('半径为 0 时退化为直角矩形', () => {
    const d = roundedRectPath(0, 0, 100, 50, 0);
    expect(d).not.toContain('A');
    expect(d.endsWith('Z')).toBe(true);
  });
});

describe('symbolPath', () => {
  it('各形状都返回闭合路径', () => {
    (
      ['circle', 'square', 'diamond', 'triangle', 'star', 'cross'] as const
    ).forEach((type) => {
      const d = symbolPath(type, 10, 10, 8);
      expect(d.endsWith('Z')).toBe(true);
      expect(d).not.toContain('NaN');
    });
  });

  // 边界：尺寸为 0 不产生 NaN
  it('尺寸为 0 仍合法', () => {
    expect(symbolPath('circle', 0, 0, 0)).not.toContain('NaN');
  });
});
