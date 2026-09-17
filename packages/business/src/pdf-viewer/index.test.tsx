import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PdfViewer } from './index';

const { getDocumentMock, renderMock, destroyMock, getViewportMock } =
  vi.hoisted(() => ({
    getDocumentMock: vi.fn(),
    renderMock: vi.fn(),
    destroyMock: vi.fn(),
    getViewportMock: vi.fn(),
  }));

// pdf.js 依赖真实 canvas 与 worker，单测中整体 mock 渲染层，只验证交互与状态流转
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: getDocumentMock,
}));

/** 构造假的 PDF 文档代理：3 页，视口 100 x 141 */
function makeFakeDoc() {
  return {
    numPages: 3,
    getPage: vi.fn(async () => ({
      getViewport: getViewportMock,
      render: renderMock,
    })),
    destroy: destroyMock,
  };
}

beforeAll(() => {
  // jsdom 未实现 2d 上下文，桩掉即可（组件只调用 getContext，不真正绘制）
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

beforeEach(() => {
  vi.clearAllMocks();
  getDocumentMock.mockImplementation(() => ({
    promise: Promise.resolve(makeFakeDoc()),
  }));
  // 与 pdfjs RenderTask 同形：渲染 promise + 可取消
  renderMock.mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
  getViewportMock.mockImplementation(
    ({ scale, rotation }: { scale: number; rotation: number }) => ({
      width: 100 * scale,
      height: 141 * scale,
      scale,
      rotation,
    }),
  );
});

/**
 * 按可访问名称查按钮。
 * antd Button 会对两个汉字的文案自动插入空格（「缩小」→「缩 小」），
 * 因此用正则在每个字符间容忍空白。
 */
function button(label: string): HTMLButtonElement {
  return screen.getByRole('button', {
    name: new RegExp(label.split('').join('\\s*')),
  }) as HTMLButtonElement;
}

/** 以非受控模式直接打开 */
function openViewer(url = '/aura/pdf-viewer/sample.pdf') {
  return render(<PdfViewer url={url} defaultOpen />);
}

describe('PdfViewer', () => {
  // ---- 正常 ----
  it('正常：打开后按需加载文档并显示页码', async () => {
    openViewer();

    await waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(1));
    expect(getDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/aura/pdf-viewer/sample.pdf',
        cMapPacked: true,
      }),
    );
    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
  });

  it('正常：翻页更新页码并回调 onPageChange', async () => {
    const onPageChange = vi.fn();
    render(<PdfViewer url="/a.pdf" defaultOpen onPageChange={onPageChange} />);

    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
    fireEvent.click(button('下一页'));
    expect(screen.getByText('2 / 3')).toBeDefined();
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(button('上一页'));
    expect(screen.getByText('1 / 3')).toBeDefined();
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('正常：缩放步进并钳制在范围内，到边界自动禁用', async () => {
    render(<PdfViewer url="/a.pdf" defaultOpen scaleRange={[0.8, 1.2]} />);

    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
    expect(screen.getByText('100%')).toBeDefined();
    expect(button('放大').disabled).toBe(false);
    expect(button('缩小').disabled).toBe(false);

    // 1.0 → 1.2：到达上限
    fireEvent.click(button('放大'));
    expect(screen.getByText('120%')).toBeDefined();
    expect(button('放大').disabled).toBe(true);

    // 1.2 → 1.0 → 0.8：到达下限
    fireEvent.click(button('缩小'));
    expect(screen.getByText('100%')).toBeDefined();
    fireEvent.click(button('缩小'));
    expect(screen.getByText('80%')).toBeDefined();
    expect(button('缩小').disabled).toBe(true);
    expect(button('放大').disabled).toBe(false);
  });

  it('正常：旋转按 90° 步进并归一化到 0 / 90 / 180 / 270', async () => {
    openViewer();
    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());

    // 渲染是异步的：点击后需等待新一轮渲染把 rotation 传入视口
    fireEvent.click(button('旋转'));
    await waitFor(() =>
      expect(getViewportMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ rotation: 90 }),
      ),
    );

    fireEvent.click(button('旋转'));
    fireEvent.click(button('旋转'));
    fireEvent.click(button('旋转'));
    await waitFor(() =>
      expect(getViewportMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ rotation: 0 }),
      ),
    );
  });

  it('正常：关闭弹窗后销毁文档资源', async () => {
    openViewer();
    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
    expect(destroyMock).not.toHaveBeenCalled();

    fireEvent.click(button('关闭'));
    await waitFor(() => expect(destroyMock).toHaveBeenCalledTimes(1));
  });

  // ---- 边界 ----
  it('边界：未配置 url 时不发起加载，页码显示占位符', () => {
    render(<PdfViewer defaultOpen />);

    expect(getDocumentMock).not.toHaveBeenCalled();
    expect(screen.getByText('—')).toBeDefined();
  });

  it('边界：默认关闭时不加载文档', () => {
    render(<PdfViewer url="/a.pdf" />);

    expect(getDocumentMock).not.toHaveBeenCalled();
    expect(screen.queryByText('1 / 3')).toBeNull();
  });

  it('边界：受控模式下关闭只回调 onOpenChange，不由组件改状态', async () => {
    const onOpenChange = vi.fn();
    render(<PdfViewer url="/a.pdf" open onOpenChange={onOpenChange} />);

    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
    fireEvent.click(button('关闭'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    // 受控：调用方未更新 open，弹窗内容仍在
    expect(screen.getByText('1 / 3')).toBeDefined();
  });

  it('边界：打开状态下切换 url 会销毁旧文档并重新加载', async () => {
    const { rerender } = openViewer('/a.pdf');
    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
    expect(destroyMock).not.toHaveBeenCalled();

    rerender(<PdfViewer url="/b.pdf" defaultOpen />);
    await waitFor(() => expect(destroyMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDocumentMock).toHaveBeenCalledTimes(2));
  });

  // ---- 异常 ----
  it('异常：加载失败展示错误态，可通过重试恢复', async () => {
    getDocumentMock.mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('网络超时')),
    }));
    openViewer();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('文档加载失败');
    expect(alert.textContent).toContain('网络超时');

    fireEvent.click(button('重试'));
    expect(getDocumentMock).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByText('1 / 3')).toBeDefined());
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
