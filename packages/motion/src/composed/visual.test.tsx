import React from 'react';
import { render, screen } from '@testing-library/react';
import { Aurora, Confetti, Parallax, PathDraw, ScrollDriven } from '../index';

/** composed 组件的意图断言（第二批：滚动与渲染类） */

describe('ScrollDriven', () => {
  it('以 render prop 形式接收滚动进度并渲染内容', () => {
    const { container } = render(
      <ScrollDriven>{(progress) => <div>进度：{String(progress ? 'ok' : 'ok')}</div>}</ScrollDriven>,
    );
    expect(container.textContent).toContain('进度');
  });
});

describe('Parallax', () => {
  it('按 layers 渲染各层内容', () => {
    const { container } = render(
      <Parallax
        layers={[
          { speed: 0.3, node: <div>慢层内容</div> },
          { speed: -0.6, node: <div>反向层内容</div> },
        ]}
      />,
    );
    expect(screen.getByText('慢层内容')).toBeTruthy();
    expect(screen.getByText('反向层内容')).toBeTruthy();
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(3);
  });
});

describe('PathDraw', () => {
  it('每个 path 生成一个 SVG path 节点', () => {
    const { container } = render(<PathDraw paths={['M0 0 L10 10', 'M10 10 L20 0']} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('path').length).toBe(2);
  });
});

describe('Confetti', () => {
  it('渲染全屏 canvas（pointer-events: none）', () => {
    const { container } = render(<Confetti fire={1} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.style.pointerEvents).toBe('none');
  });

  it('fire 为 0 时不发射但仍渲染挂载点', () => {
    const { container } = render(<Confetti fire={0} count={10} />);
    expect(container.querySelector('canvas')).toBeTruthy();
  });
});

describe('Aurora', () => {
  it('按 blobs 数量渲染色块', () => {
    const { container } = render(<Aurora blobs={4} height={200} />);
    // 容器 + 4 个色块
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(5);
  });

  it('自定义颜色不报错', () => {
    const { container } = render(<Aurora colors={['#534ab7']} />);
    expect(container.firstElementChild).toBeTruthy();
  });
});
