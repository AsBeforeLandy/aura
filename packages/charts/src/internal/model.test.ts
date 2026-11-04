import { describe, it, expect } from 'vitest';
import {
  applyStacking,
  assignDefaultStack,
  resolveSeries,
  resolveXValues,
  resolveYDomain,
  buildTooltipItems,
} from './model';
import { createChartTheme } from '../theme';
import type { SeriesConfig } from '../types';

const theme = createChartTheme();

const data = [
  { m: '1月', a: 10, b: null },
  { m: '2月', a: -20, b: 30 },
  { m: '3月', a: 40, b: 50 },
];

function build(series: SeriesConfig[], hidden?: string[]) {
  return resolveSeries({
    data,
    series,
    theme,
    defaultType: 'line',
    hidden: hidden ? new Set(hidden) : undefined,
  });
}

describe('resolveSeries', () => {
  it('从 data 取数值，缺失记为 null', () => {
    const [a, b] = build([{ key: 'a' }, { key: 'b' }]);
    expect(a.values).toEqual([10, -20, 40]);
    expect(b.values).toEqual([null, 30, 50]);
  });

  it('支持 series.data 直接给数组', () => {
    const [item] = build([{ key: 'x', data: [1, 2, 3] }]);
    expect(item.values).toEqual([1, 2, 3]);
  });

  it('保留 yAxisIndex 供双轴使用', () => {
    const [item] = build([{ key: 'a', yAxisIndex: 1 }]);
    expect(item.config.yAxisIndex).toBe(1);
  });

  it('hidden 列表中的系列不可见', () => {
    const [, b] = build([{ key: 'a' }, { key: 'b' }], ['b']);
    expect(b.visible).toBe(false);
  });
});

describe('applyStacking', () => {
  it('同 stack 的正值累加、负值分开累加', () => {
    const list = build([
      { key: 'a', stack: 's' },
      { key: 'b', stack: 's' },
    ]);

    applyStacking(list);

    // 2月：a = -20（负），b = 30（正）→ 两者不互相抵消
    expect(list[0].base[1]).toBe(0);
    expect(list[0].top[1]).toBe(-20);
    expect(list[1].base[1]).toBe(0);
    expect(list[1].top[1]).toBe(30);

    // 3月：都是正数 → b 叠在 a 上面
    expect(list[0].top[2]).toBe(40);
    expect(list[1].base[2]).toBe(40);
    expect(list[1].top[2]).toBe(90);
  });

  it('不同 stack 分组互不影响', () => {
    const list = build([
      { key: 'a', stack: 's1' },
      { key: 'b', stack: 's2' },
    ]);
    applyStacking(list);
    expect(list[1].base[2]).toBe(0);
  });

  // 边界：没有 stack 的系列不参与累加
  it('无 stackId 的系列保持基线为 0', () => {
    const list = build([{ key: 'a' }, { key: 'b' }]);
    applyStacking(list);
    expect(list.every((item) => item.base.every((value) => value === 0))).toBe(
      true,
    );
  });

  it('assignDefaultStack 给所有可见系列打上同一个 stack id', () => {
    const list = build([{ key: 'a' }, { key: 'b' }]);
    assignDefaultStack(list, true);
    expect(list[0].stackId).toBe(list[1].stackId);
  });
});

describe('resolveYDomain', () => {
  it('统计所有可见系列的范围', () => {
    const list = build([{ key: 'a' }, { key: 'b' }]);
    expect(resolveYDomain(list)).toEqual([-20, 50]);
  });

  it('startFromZero 把 0 纳入范围', () => {
    const list = build([{ key: 'b' }]);
    expect(resolveYDomain(list, { startFromZero: true })).toEqual([0, 50]);
  });

  it('min / max 可强制覆盖', () => {
    const list = build([{ key: 'a' }]);
    expect(resolveYDomain(list, { min: -100, max: 100 })).toEqual([-100, 100]);
  });

  // 双轴关键：只统计指定轴上的系列
  it('yAxisIndex 过滤系列', () => {
    const list = build([{ key: 'a' }, { key: 'b', yAxisIndex: 1 }]);
    // a 的三个值分别是 10 / -20 / 40，因此左轴范围含负值
    expect(resolveYDomain(list, { yAxisIndex: 0 })).toEqual([-20, 40]);
    expect(resolveYDomain(list, { yAxisIndex: 1 })).toEqual([30, 50]);
  });

  // 边界：该轴没有系列时返回安全值域
  it('指定轴上没有数据时返回退化值域', () => {
    const list = build([{ key: 'a' }]);
    expect(resolveYDomain(list, { yAxisIndex: 1 })).toEqual([0, 1]);
  });

  // 异常：全零数据不能得到 [0,0]，否则比例尺会除零
  it('全零数据返回 [0, 1]', () => {
    const list = build([{ key: 'z', data: [0, 0, 0] }]);
    expect(resolveYDomain(list)).toEqual([0, 1]);
  });
});

describe('resolveXValues / buildTooltipItems', () => {
  it('按 xKey 取分类值', () => {
    expect(resolveXValues(data, 'm')).toEqual(['1月', '2月', '3月']);
  });

  // null 不是「跳过」，而是显式渲染成占位符——读者需要知道这一项确实缺数据
  it('tooltip 为缺失值渲染占位符', () => {
    const list = build([{ key: 'a' }, { key: 'b' }]);
    const items = buildTooltipItems(list, 0);
    expect(items).toHaveLength(2);
    expect(items[0].value).toBe(10);
    expect(items[1].value).toBeNull();
    expect(items[1].formatted).toBe('—');
  });
});
