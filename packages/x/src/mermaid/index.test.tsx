import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import mermaid from 'mermaid';
import { Mermaid } from './index';

/** 真实的 mermaid 依赖大量 DOM 能力，测试里替换成可预期的替身 */
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (id: string) => ({
      svg: `<svg data-testid="mock-graph" id="${id}"><text>graph</text></svg>`,
    })),
  },
}));

const runtime = vi.mocked(mermaid as unknown as {
  initialize: ReturnType<typeof vi.fn>;
  render: ReturnType<typeof vi.fn>;
});

const CODE = 'graph TD\n  A --> B';

const writeText = vi.fn<[string], Promise<void>>();

beforeEach(() => {
  runtime.initialize.mockClear();
  runtime.render.mockClear();
  runtime.render.mockImplementation(async (id: string) => ({
    svg: `<svg data-testid="mock-graph" id="${id}"><text>graph</text></svg>`,
  }));

  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock'),
    configurable: true,
    writable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Mermaid', () => {
  it('正常：渲染完成后把 SVG 注入画布', async () => {
    const { container } = render(<Mermaid>{CODE}</Mermaid>);

    expect(container.querySelector('.aura-x-mermaid-loading')).not.toBeNull();

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="mock-graph"]'),
      ).not.toBeNull();
    });
    expect(runtime.initialize).toHaveBeenCalledTimes(1);
    expect(runtime.render).toHaveBeenCalledTimes(1);
  });

  it('正常：默认头部渲染视图切换与操作按钮', async () => {
    render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    expect(screen.getByRole('button', { name: '图片' })).toBeDefined();
    expect(screen.getByRole('button', { name: '代码' })).toBeDefined();
    expect(screen.getByRole('button', { name: '放大' })).toBeDefined();
    expect(screen.getByRole('button', { name: '缩小' })).toBeDefined();
    expect(screen.getByRole('button', { name: '重置缩放' })).toBeDefined();
    expect(screen.getByRole('button', { name: '复制源码' })).toBeDefined();
    expect(screen.getByRole('button', { name: '下载 SVG' })).toBeDefined();
  });

  it('正常：切到代码视图渲染源码并回调 onRenderTypeChange', async () => {
    const onRenderTypeChange = vi.fn();
    const { container } = render(
      <Mermaid onRenderTypeChange={onRenderTypeChange}>{CODE}</Mermaid>,
    );
    await screen.findByTestId('mock-graph');

    fireEvent.click(screen.getByRole('button', { name: '代码' }));

    expect(onRenderTypeChange).toHaveBeenCalledWith('code');
    expect(container.querySelector('.aura-x-mermaid-body--code')).not.toBeNull();
    expect(screen.queryByTestId('mock-graph')).toBeNull();
  });

  it('正常：缩放与重置修改画布 transform', async () => {
    const { container } = render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    const canvas = () => container.querySelector('.aura-x-mermaid-canvas');
    expect(canvas()?.getAttribute('style')).toContain('scale(1)');

    fireEvent.click(screen.getByRole('button', { name: '放大' }));
    expect(canvas()?.getAttribute('style')).toContain('scale(1.2)');

    fireEvent.click(screen.getByRole('button', { name: '缩小' }));
    fireEvent.click(screen.getByRole('button', { name: '缩小' }));
    expect(canvas()?.getAttribute('style')).toContain('scale(0.8)');

    fireEvent.click(screen.getByRole('button', { name: '重置缩放' }));
    expect(canvas()?.getAttribute('style')).toContain('scale(1)');
  });

  it('正常：复制源码写入剪贴板', async () => {
    render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    fireEvent.click(screen.getByRole('button', { name: '复制源码' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(CODE);
    });
    expect(await screen.findByRole('button', { name: '已复制' })).toBeDefined();
  });

  it('正常：下载导出 SVG 并释放 object URL', async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    fireEvent.click(screen.getByRole('button', { name: '下载 SVG' }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('边界：header=null 不渲染头部', async () => {
    const { container } = render(<Mermaid header={null}>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    expect(container.querySelector('.aura-x-mermaid-header')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('边界：自定义 header 替换默认头部，内置操作按钮消失', async () => {
    render(<Mermaid header={<span>渲染链路</span>}>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    expect(screen.getByText('渲染链路')).toBeDefined();
    expect(screen.queryByRole('button', { name: '图片' })).toBeNull();
    expect(screen.queryByRole('button', { name: '下载 SVG' })).toBeNull();
  });

  it('边界：actions 关闭后对应按钮不渲染', async () => {
    render(
      <Mermaid actions={{ enableZoom: false, enableCopy: false }}>
        {CODE}
      </Mermaid>,
    );
    await screen.findByTestId('mock-graph');

    expect(screen.queryByRole('button', { name: '放大' })).toBeNull();
    expect(screen.queryByRole('button', { name: '复制源码' })).toBeNull();
    expect(screen.getByRole('button', { name: '下载 SVG' })).toBeDefined();
  });

  it('边界：缩放达到上下限时按钮禁用', async () => {
    render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    const zoomIn = screen.getByRole('button', { name: '放大' });
    const zoomOut = screen.getByRole('button', { name: '缩小' });
    expect((zoomIn as HTMLButtonElement).disabled).toBe(false);

    // 1 → 3 需 10 次，多按几次验证钳制在上限
    for (let i = 0; i < 15; i += 1) {
      fireEvent.click(zoomIn);
    }
    expect((zoomIn as HTMLButtonElement).disabled).toBe(true);

    for (let i = 0; i < 20; i += 1) {
      fireEvent.click(zoomOut);
    }
    expect((zoomOut as HTMLButtonElement).disabled).toBe(true);
    expect((zoomIn as HTMLButtonElement).disabled).toBe(false);
  });

  it('异常：渲染失败时展示错误详情，不白屏', async () => {
    runtime.render.mockRejectedValue(new Error('Parse error on line 2'));
    const { container } = render(<Mermaid>{CODE}</Mermaid>);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('图表渲染失败');
    expect(alert.textContent).toContain('Parse error on line 2');
    expect(container.querySelector('[data-testid="mock-graph"]')).toBeNull();
  });

  it('异常：渲染失败后仍可切到代码视图定位问题', async () => {
    runtime.render.mockRejectedValue(new Error('bad syntax'));
    const { container } = render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: '代码' }));

    expect(container.querySelector('.aura-x-mermaid-body--code')).not.toBeNull();
    expect(container.querySelector('pre')?.textContent).toContain('A --> B');
  });

  it('a11y：渲染成功态无 axe 违规', async () => {
    const { container } = render(<Mermaid>{CODE}</Mermaid>);
    await screen.findByTestId('mock-graph');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
