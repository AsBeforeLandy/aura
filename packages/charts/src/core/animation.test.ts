import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ANIMATION,
  getEasing,
  hashMatrix,
  lerp,
  resolveAnimation,
  staggerProgress,
} from './animation';

describe('缓动函数', () => {
  it('所有缓动都从 0 开始、到 1 结束', () => {
    (
      ['linear', 'easeOutCubic', 'easeOutQuint', 'easeInOutCubic'] as const
    ).forEach((name) => {
      const ease = getEasing(name);
      expect(ease(0)).toBeCloseTo(0, 5);
      expect(ease(1)).toBeCloseTo(1, 5);
    });
  });

  it('减速曲线在中点已走过一半以上', () => {
    expect(getEasing('easeOutQuint')(0.5)).toBeGreaterThan(0.9);
    expect(getEasing('easeOutCubic')(0.5)).toBeGreaterThan(0.8);
  });

  // 回弹曲线允许轻微过冲，但不能失控
  it('easeOutBack 有过冲但幅度有限', () => {
    const peak = Math.max(
      ...Array.from({ length: 100 }, (_, i) =>
        getEasing('easeOutBack')(i / 99),
      ),
    );
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThan(1.15);
  });

  // 异常：未知曲线回退到默认，不抛错
  it('未知曲线名回退到 easeOutQuint', () => {
    // @ts-expect-error 故意传非法值
    expect(getEasing('nope')(0.5)).toBeCloseTo(
      getEasing('easeOutQuint')(0.5),
      5,
    );
  });
});

describe('staggerProgress', () => {
  it('首个元素最先开始，末个最晚', () => {
    const t = 0.5;
    const first = staggerProgress(t, 0, 5, 0.4);
    const last = staggerProgress(t, 4, 5, 0.4);
    expect(first).toBeGreaterThan(last);
  });

  // 边界：只有一个元素时不做错峰
  it('单元素直接返回全局进度', () => {
    expect(staggerProgress(0.3, 0, 1, 0.5)).toBe(0.3);
  });

  // 边界：stagger 为 0 时所有元素同步
  it('stagger 为 0 时全部同步', () => {
    expect(staggerProgress(0.6, 3, 5, 0)).toBe(0.6);
  });

  it('结果始终落在 0~1 之间', () => {
    for (let i = 0; i < 6; i += 1) {
      expect(staggerProgress(0, i, 6, 0.5)).toBeGreaterThanOrEqual(0);
      expect(staggerProgress(1, i, 6, 0.5)).toBeLessThanOrEqual(1);
      expect(staggerProgress(-1, i, 6, 0.5)).toBe(0);
    }
  });

  // 边界：stagger 取满时退化为「依次瞬现」
  it('stagger 为 1 时元素按序直接到位', () => {
    expect(staggerProgress(0.5, 0, 4, 1)).toBe(1);
    expect(staggerProgress(0.1, 3, 4, 1)).toBe(0);
  });

  it('进度到 1 时所有元素都已到位', () => {
    for (let i = 0; i < 6; i += 1) {
      expect(staggerProgress(1, i, 6, 0.5)).toBe(1);
    }
  });
});

describe('resolveAnimation', () => {
  it('默认开启并带错峰', () => {
    const config = resolveAnimation();
    expect(config.enabled).toBe(true);
    expect(config.duration).toBe(DEFAULT_ANIMATION.duration);
    expect(config.stagger).toBe(DEFAULT_ANIMATION.stagger);
  });

  it('可强制关闭默认开关', () => {
    const config = resolveAnimation(undefined, false);
    expect(config.enabled).toBe(false);
  });

  it('传 false 时立即到达终态', () => {
    const config = resolveAnimation(false);
    expect(config.enabled).toBe(false);
    expect(config.duration).toBe(0);
    expect(config.ease(0.5)).toBe(0.5);
  });

  it('传对象可覆盖时长与缓动', () => {
    const config = resolveAnimation({
      duration: 1200,
      easing: 'easeOutBack',
      stagger: 0.8,
    });
    expect(config.duration).toBe(1200);
    expect(config.easing).toBe('easeOutBack');
    expect(config.stagger).toBeCloseTo(0.8);
  });

  // 异常：负数时长 / 超范围 stagger 都要被夹紧
  it('非法参数被夹紧', () => {
    const config = resolveAnimation({ duration: -100, stagger: 5, delay: -20 });
    expect(config.duration).toBe(0);
    expect(config.stagger).toBe(1);
    expect(config.delay).toBe(0);
  });
});

describe('hashMatrix / lerp', () => {
  it('相同数据得到相同指纹', () => {
    expect(hashMatrix([[1, 2]])).toBe(hashMatrix([[1, 2]]));
  });

  it('数值变化会改变指纹', () => {
    expect(hashMatrix([[1, 2]])).not.toBe(hashMatrix([[1, 2.5]]));
  });

  // 边界：null 与 0 不能混淆
  it('null 与 0 的指纹不同', () => {
    expect(hashMatrix([[null]])).not.toBe(hashMatrix([[0]]));
  });

  it('lerp 在两端取原值', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});
