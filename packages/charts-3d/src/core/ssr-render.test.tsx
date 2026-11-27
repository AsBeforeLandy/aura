// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Scene3D } from './Scene3D';
import { ParticleField } from '../charts/ParticleField';
import { DandelionField } from '../charts/DandelionField';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染顶层 3D 容器组件。
 * 尺寸测量与 WebGL 上下文初始化全部延迟到浏览器挂载后，渲染期不触碰 window/document。
 */
describe('charts-3d SSR 渲染', () => {
  it('Scene3D 及其视角配置可在 Node 环境安全渲染且不产出 canvas', () => {
    const html = renderToString(
      <Scene3D
        height={400}
        preset="inspection"
        autoRotate
        autoRotateSpeed={0.4}
      >
        {null}
      </Scene3D>,
    );

    expect(html).toContain('height:400px');
    expect(html).not.toContain('<canvas');
  });

  it('ParticleField 装饰层可在 Node 环境安全渲染', () => {
    const particleHtml = renderToString(
      <ParticleField height={280} count={80} showLinks />,
    );

    expect(particleHtml).toContain('height:280px');
    expect(particleHtml).not.toContain('<canvas');
  });

  it('DandelionField 可在 Node 环境安全渲染并保留前景内容', () => {
    const html = renderToString(
      <DandelionField height={360}>
        <span>前景文案</span>
      </DandelionField>,
    );

    expect(html).toContain('aura-dandelion-field');
    expect(html).toContain('前景文案');
    expect(html).not.toContain('<canvas');
  });
});
