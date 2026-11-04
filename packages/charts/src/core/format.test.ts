import { describe, it, expect } from 'vitest';
import {
  estimateTextWidth,
  formatCompact,
  formatNumber,
  formatPercent,
  inferDecimals,
  padNumberLabels,
} from './format';

describe('formatCompact', () => {
  it('按中文习惯使用万 / 亿', () => {
    expect(formatCompact(12345)).toBe('1.2万');
    expect(formatCompact(123456789)).toBe('1.2亿');
    expect(formatCompact(1500)).toBe('1.5k');
    expect(formatCompact(320)).toBe('320');
  });

  it('保留负号', () => {
    expect(formatCompact(-15000)).toBe('-1.5万');
  });

  it('去掉多余的小数零', () => {
    expect(formatCompact(20000)).toBe('2万');
  });
});

describe('formatNumber', () => {
  it('默认加千分位', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('支持关闭千分位', () => {
    expect(formatNumber(1234567, { thousands: false })).toBe('1234567');
  });

  it('支持固定小数位与前后缀', () => {
    expect(formatNumber(0.5, { decimals: 2, suffix: '%' })).toBe('0.50%');
    expect(formatNumber(99, { prefix: '¥' })).toBe('¥99');
  });

  it('compact 优先于千分位', () => {
    expect(formatNumber(23000, { compact: true })).toBe('2.3万');
  });

  // 异常：非有限值不应显示 NaN
  it('非有限值显示占位符', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('—');
  });

  // 边界：负数千分位
  it('负数正确分组', () => {
    expect(formatNumber(-1234567)).toBe('-1,234,567');
  });
});

describe('formatPercent', () => {
  it('按总量换算百分比', () => {
    expect(formatPercent(25, 100)).toBe('25%');
    expect(formatPercent(1, 3, 2)).toBe('33.33%');
  });

  // 异常：总量为 0 时不能让 NaN 泄漏到界面
  it('总量为 0 返回 0%', () => {
    expect(formatPercent(10, 0)).toBe('0%');
  });
});

describe('inferDecimals', () => {
  it('取数据中最多的小数位', () => {
    expect(inferDecimals([1, 2.5, 3.25])).toBe(2);
  });

  // 边界：无小数返回 0；小数位超长时被截断到 4
  it('小数位上限为 4', () => {
    expect(inferDecimals([1, 2])).toBe(0);
    expect(inferDecimals([0.123456])).toBe(4);
  });

  it('忽略非数值', () => {
    expect(inferDecimals([Number.NaN, 1.5])).toBe(1);
  });
});

describe('estimateTextWidth', () => {
  it('中文宽度约为字号的 1 倍，英文约 0.58 倍', () => {
    const fontSize = 12;
    expect(estimateTextWidth('中文', fontSize)).toBeCloseTo(24, 0);
    expect(estimateTextWidth('ab', fontSize)).toBeCloseTo(12 * 0.58 * 2, 0);
  });

  it('空字符串宽度为 0', () => {
    expect(estimateTextWidth('', 12)).toBe(0);
  });
});

describe('padNumberLabels', () => {
  it('纯数字标签按最长长度补空格', () => {
    expect(padNumberLabels(['1', '100', '20'])).toEqual(['  1', '100', ' 20']);
  });

  // 边界：含中文的标签不补（否则「1月」会变成「 1月」）
  it('非纯数字标签原样返回', () => {
    expect(padNumberLabels(['1月', '10月'])).toEqual(['1月', '10月']);
  });

  it('空数组安全返回', () => {
    expect(padNumberLabels([])).toEqual([]);
  });
});
