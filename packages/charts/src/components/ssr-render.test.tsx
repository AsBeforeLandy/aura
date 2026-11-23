// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Chart } from './chart';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染图表。
 * 图表的主题解析（cssVar / detectDarkMode → readAuraTheme）均带
 * typeof window/document 守卫与回退，渲染期不应访问浏览器 API；
 * 尺寸测量与 ECharts 初始化在 effect 中挂载后执行，服务端不触发。
 */

describe('Chart SSR 渲染', () => {
  it('折线图最小数据可服务端渲染', () => {
    const html = renderToString(
      <Chart
        option={{
          xAxis: { data: ['一月', '二月', '三月'] },
          series: [{ type: 'line', name: '销量', data: [120, 200, 150] }],
        }}
      />,
    );

    expect(html).not.toBe('');
  });

  it('饼图最小数据可服务端渲染', () => {
    const html = renderToString(
      <Chart
        option={{
          xAxis: { data: ['直接', '搜索'] },
          series: [{ type: 'pie', name: '来源', data: [60, 40] }],
        }}
      />,
    );

    expect(html).not.toBe('');
  });
});
