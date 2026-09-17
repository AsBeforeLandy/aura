import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Modal, Space, Spin } from 'antd';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { classNames, prefixCls } from '@aura/shared';
import {
  clampPage,
  DEFAULT_SCALE_RANGE,
  isRenderCancelled,
  normalizeRotation,
  stepScale,
} from './utils';
import './index.less';

/* ===== pdf.js worker 与运行参数 ===== */

// 与所装 pdfjs-dist 同版本的 worker，交给打包器解析（webpack5 / Vite 均支持该写法）。
// 注意：跨域 CDN 地址受同源策略限制，不能直接充当 worker；
// 需要自托管 / CDN 时请通过 workerSrc 传入同源副本地址。
const DEFAULT_WORKER_SRC = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

// 仅在宿主尚未自行配置时兜底，避免覆盖应用的全局 worker 设置
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = DEFAULT_WORKER_SRC;
}

/** 所依赖的 pdfjs-dist 版本（用于默认 cMap 地址；升级依赖时需同步修改） */
export const PDFJS_VERSION = '4.10.38';

export interface PdfViewerProps {
  /** PDF 文件地址（需同源，或服务端允许跨域） */
  url?: string;
  /** 是否显示预览弹窗（受控） */
  open?: boolean;
  /** 默认是否显示（非受控） */
  defaultOpen?: boolean;
  /** 弹窗显隐变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 弹窗标题
   *  @default '文档预览'
   */
  title?: React.ReactNode;
  /** 初始缩放比例（1 = 100%）
   *  @default 1
   */
  initialScale?: number;
  /** 缩放范围 [最小, 最大]
   *  @default [0.5, 3]
   */
  scaleRange?: [number, number];
  /** pdf.js worker 脚本地址；默认使用与依赖同版本的 worker 文件（webpack5 / Vite 自动解析） */
  workerSrc?: string;
  /**
   * CMap 字体映射资源地址（渲染 CJK 等文档时需要）。
   * 默认指向与依赖同版本的 jsdelivr CDN；传空串可禁用。
   */
  cMapUrl?: string;
  /** 页码变化回调 */
  onPageChange?: (page: number) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * PdfViewer — PDF 弹窗预览
 *
 * 基于 pdf.js 渲染：支持翻页、缩放、旋转与拖拽平移，打开时按需加载、
 * 关闭即销毁文档资源。触发方式（按钮 / 链接 / 列表行点击）由调用方组合。
 *
 * 与一般预览方案（iframe / 浏览器内置阅读器）不同，canvas 渲染的观感
 * 在各浏览器一致，且可禁用下载入口，适合合同、报告等受控预览场景。
 */
const PdfViewer = forwardRef<HTMLDivElement, PdfViewerProps>(
  (
    {
      url,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      title = '文档预览',
      initialScale = 1,
      scaleRange = DEFAULT_SCALE_RANGE,
      workerSrc,
      cMapUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
      onPageChange,
      className,
      style,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);

    const isControlled = controlledOpen !== undefined;
    const [innerOpen, setInnerOpen] = useState(defaultOpen);
    const visible = isControlled ? controlledOpen : innerOpen;

    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(initialScale);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    /** 递增触发重新加载（重试按钮） */
    const [reloadToken, setReloadToken] = useState(0);

    // 平移：高频 pointermove 经 rAF 合并，每帧至多一次 setState
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [panning, setPanning] = useState(false);
    const panStartRef = useRef<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
    } | null>(null);
    const panRafRef = useRef<number | null>(null);
    const pendingPanRef = useRef<{ x: number; y: number } | null>(null);

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInnerOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    // worker 为全局配置，实例级传入时覆盖
    useEffect(() => {
      if (!workerSrc) return;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    }, [workerSrc]);

    // 关闭即销毁文档与渲染任务，避免大文件滞留内存；状态一并复位
    useEffect(() => {
      if (visible) return;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      pdfDocRef.current?.destroy();
      pdfDocRef.current = null;
      setPdfDoc(null);
      setNumPages(0);
      setPageNumber(1);
      setScale(initialScale);
      setRotation(0);
      setTranslate({ x: 0, y: 0 });
      setError(null);
      setLoading(false);
    }, [visible, initialScale]);

    // 按需加载：仅打开且配置了 url 时请求
    useEffect(() => {
      if (!visible || !url) return;
      let cancelled = false;
      setLoading(true);
      setError(null);

      pdfjsLib
        .getDocument({ url, cMapUrl: cMapUrl || undefined, cMapPacked: true })
        .promise.then((doc) => {
          if (cancelled) {
            // 弹窗已关闭或 url 已变更，立即释放避免泄漏
            doc.destroy();
            return;
          }
          pdfDocRef.current = doc;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNumber(1);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        });

      return () => {
        cancelled = true;
        // url 变更 / 关闭 / 卸载时释放当前文档：
        // - 尚在加载的文档由上方 cancelled 分支销毁（未进 ref，不会重复销毁）
        // - 已加载完成的文档在此销毁并清空 ref，供后续分支安全跳过
        renderTaskRef.current?.cancel();
        pdfDocRef.current?.destroy();
        pdfDocRef.current = null;
      };
    }, [visible, url, cMapUrl, reloadToken]);

    // 渲染当前页：翻页 / 缩放 / 旋转变化时重绘
    useEffect(() => {
      if (!visible || !pdfDoc) return;
      let cancelled = false;
      setLoading(true);
      // 主动取消上一次渲染，避免快速翻页 / 缩放时旧任务覆盖画布
      renderTaskRef.current?.cancel();

      const render = async () => {
        try {
          const page = await pdfDoc.getPage(pageNumber);
          const canvas = canvasRef.current;
          if (cancelled || !canvas) return;
          const context = canvas.getContext('2d');
          if (!context) {
            setLoading(false);
            return;
          }

          // 画布按设备像素比放大，避免高倍屏下模糊
          const dpr = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: scale * dpr, rotation });
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
          canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

          const task = page.render({ canvasContext: context, viewport });
          renderTaskRef.current = task;
          await task.promise;
          if (!cancelled) setLoading(false);
        } catch (err) {
          if (cancelled || isRenderCancelled(err)) return;
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      };
      render();

      return () => {
        cancelled = true;
      };
    }, [pdfDoc, pageNumber, scale, rotation, visible]);

    // 卸载兜底：组件销毁时释放文档与未完成的帧回调
    useEffect(
      () => () => {
        renderTaskRef.current?.cancel();
        pdfDocRef.current?.destroy();
        pdfDocRef.current = null;
        if (panRafRef.current != null) {
          window.cancelAnimationFrame(panRafRef.current);
        }
      },
      [],
    );

    const goToPage = useCallback(
      (next: number) => {
        const target = clampPage(next, numPages);
        if (target !== pageNumber) {
          setPageNumber(target);
          setTranslate({ x: 0, y: 0 });
          onPageChange?.(target);
        }
      },
      [numPages, pageNumber, onPageChange],
    );

    const zoom = useCallback(
      (direction: 1 | -1) => {
        setScale((prev) => stepScale(prev, direction, scaleRange));
      },
      [scaleRange],
    );

    const rotate = useCallback(() => {
      setRotation((prev) => normalizeRotation(prev + 90));
    }, []);

    /* ===== 拖拽平移（pointer 统一鼠标与触摸） ===== */

    const flushPan = useCallback(() => {
      panRafRef.current = null;
      const pending = pendingPanRef.current;
      pendingPanRef.current = null;
      if (pending) setTranslate(pending);
    }, []);

    const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      // 捕获指针后，移出容器也能继续收到 move / up
      e.currentTarget.setPointerCapture?.(e.pointerId);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        baseX: translate.x,
        baseY: translate.y,
      };
      setPanning(true);
    };

    const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const start = panStartRef.current;
      if (!start) return;
      pendingPanRef.current = {
        x: start.baseX + (e.clientX - start.x),
        y: start.baseY + (e.clientY - start.y),
      };
      if (panRafRef.current == null) {
        panRafRef.current = window.requestAnimationFrame(flushPan);
      }
    };

    const handlePanEnd = () => {
      panStartRef.current = null;
      setPanning(false);
    };

    const stageCls = classNames(
      prefixCls('pdf-viewer-stage'),
      panning && prefixCls('pdf-viewer-stage-panning'),
    );

    return (
      <div
        ref={ref}
        className={classNames(prefixCls('pdf-viewer'), className)}
        style={style}
      >
        <Modal
          open={visible}
          onCancel={() => setOpen(false)}
          title={title}
          centered
          width="96%"
          footer={
            <div className={prefixCls('pdf-viewer-toolbar')}>
              <Space size={4}>
                <Button
                  size="small"
                  onClick={() => zoom(-1)}
                  disabled={!pdfDoc || scale <= scaleRange[0]}
                >
                  缩小
                </Button>
                <span className={prefixCls('pdf-viewer-scale')}>
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  size="small"
                  onClick={() => zoom(1)}
                  disabled={!pdfDoc || scale >= scaleRange[1]}
                >
                  放大
                </Button>
                <Button size="small" onClick={rotate} disabled={!pdfDoc}>
                  旋转
                </Button>
              </Space>
              <span className={prefixCls('pdf-viewer-page')} role="status">
                {numPages > 0 ? `${pageNumber} / ${numPages}` : '—'}
              </span>
              <Space size={4}>
                <Button
                  size="small"
                  onClick={() => goToPage(pageNumber - 1)}
                  disabled={!pdfDoc || pageNumber <= 1}
                >
                  上一页
                </Button>
                <Button
                  size="small"
                  onClick={() => goToPage(pageNumber + 1)}
                  disabled={!pdfDoc || pageNumber >= numPages}
                >
                  下一页
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setOpen(false)}
                >
                  关闭
                </Button>
              </Space>
            </div>
          }
        >
          {error ? (
            <div className={prefixCls('pdf-viewer-error')} role="alert">
              <p className={prefixCls('pdf-viewer-error-title')}>
                文档加载失败
              </p>
              <p className={prefixCls('pdf-viewer-error-detail')}>{error}</p>
              <Button size="small" onClick={() => setReloadToken((t) => t + 1)}>
                重试
              </Button>
            </div>
          ) : (
            <div
              className={stageCls}
              onPointerDown={handlePanStart}
              onPointerMove={handlePanMove}
              onPointerUp={handlePanEnd}
              onPointerCancel={handlePanEnd}
            >
              {loading && (
                <div className={prefixCls('pdf-viewer-loading')}>
                  <Spin />
                </div>
              )}
              <div
                className={prefixCls('pdf-viewer-canvas-wrap')}
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px)`,
                  transition: panning
                    ? 'none'
                    : 'transform var(--aura-duration-normal) var(--aura-easing)',
                }}
              >
                <canvas ref={canvasRef} role="img" aria-label="PDF 文档预览" />
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  },
);

PdfViewer.displayName = 'PdfViewer';

export { PdfViewer };
