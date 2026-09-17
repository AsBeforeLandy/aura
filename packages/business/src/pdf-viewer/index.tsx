import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Modal, Space, Spin } from 'antd';
import * as pdfjsLib from 'pdfjs-dist';
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from 'pdfjs-dist';
import { classNames, prefixCls } from '@aura/shared';
import {
  clampPage,
  DEFAULT_SCALE_RANGE,
  isRenderCancelled,
  normalizeRotation,
  stepScale,
} from './utils';
import './index.less';

/* ===== pdf.js worker 策略 ===== */

/**
 * 启用主线程渲染（默认）。
 *
 * pdf.js 会优先查找 `globalThis.pdfjsWorker.WorkerMessageHandler`，命中则直接用其
 * handler 在主线程解析文档：**不创建独立 worker、不请求任何外部文件**，因此不受
 * 打包器对 worker 文件的处理方式影响，也没有 CDN / 同源 / MIME 的额外约束。
 *
 * 为什么不用 `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`？
 * 该写法会把 worker 送进打包器的 JS 处理管线：实测 dumi/webpack 会把文件包进 IIFE、
 * 却把顶层 `export` 留在函数体内，产物不再是合法 ES Module，运行时抛
 * `SyntaxError: Unexpected token 'export'`——真 worker 与 pdf.js 的主线程回退同时失效。
 *
 * 代价是解析占用主线程，超大文档可能影响交互流畅度。需要独立线程时，用 `workerSrc`
 * 指向自托管的原样 worker 文件（见文档「worker 配置」）。
 */
async function ensureMainThreadWorker(): Promise<void> {
  const g = globalThis as { pdfjsWorker?: unknown };
  if (g.pdfjsWorker) return;
  // 动态引入以便按需加载（未使用 pdf 预览的页面不会付出这部分体积）
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs');
  g.pdfjsWorker = workerModule;
}

/** 宿主是否已显式指定 worker（此时走真正的独立线程） */
function hasExplicitWorkerSrc(workerSrc?: string): boolean {
  return !!workerSrc || !!pdfjsLib.GlobalWorkerOptions.workerSrc;
}

/**
 * 原生动态导入。
 *
 * 用 `new Function` 包一层：打包器无法静态分析函数体内部的 `import()`，
 * 因此不会把它改写成自己的模块解析逻辑（实测 `import(/* webpackIgnore *​/ url)`
 * 的提示注释会在压缩阶段丢失，导致 URL 导入被改写）。用于需要**绕开打包器**
 * 加载原样资源（pdf.js 主模块 / worker）的场景。
 */
const nativeImport = <T,>(url: string): Promise<T> =>
  (new Function('u', 'return import(u)') as (u: string) => Promise<T>)(url);

/** 解析实际使用的 pdf.js 实例 */
async function resolvePdfjs(src?: string): Promise<typeof pdfjsLib> {
  // 显式指定地址 → 运行时加载（不经打包器）
  if (src) return nativeImport<typeof pdfjsLib>(src);
  // 默认：使用随产物打包的实例
  return pdfjsLib;
}

/** 由 pdf.js 主模块地址推导同目录下的 worker 模块地址 */
function deriveWorkerUrl(pdfjsSrc: string): string {
  return pdfjsSrc.replace(/pdf(?:\.min)?\.mjs$/, 'pdf.worker.min.mjs');
}

/**
 * 默认资源基地址：按**运行时版本**推导的官方 CDN。
 *
 * 必须显式传入 cmaps / wasm / iccs / standard_fonts 的地址，不能让 pdf.js 自行推导：
 * 它用 `import.meta.url` 定位这些资源，而打包器会把它替换成构建机上的绝对路径
 * （实测产物中出现 `file:///Users/...`），运行时必然取不到资源。
 *
 * 用 `pdfjs.version` 而非硬编码版本号，可避免依赖升级后地址与实际版本漂移。
 */
function defaultAssetBaseUrl(pdfjs: typeof pdfjsLib): string {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/`;
}

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
  /**
   * 运行时加载 pdf.js 的地址（不经打包器，`import(url)` 直取）。
   *
   * 用于宿主构建无法正确打包 pdf.js 的场景（详见文档「已知问题」）：
   * 传同源或 CDN 上的**原样** `pdf.min.mjs` 地址即可绕开打包器处理。
   * 此时通常还需同时指定 `workerSrc`（同一份原样 worker 文件）。
   */
  pdfjsSrc?: string;
  /**
   * pdf.js worker 脚本地址。
   * 不传时在主线程渲染（零配置、无外部请求，大文档可能影响交互）；
   * 传入后启用独立线程，需指向**原样**的 worker 文件（自托管或 CDN），
   * 详见文档「worker 配置」。
   */
  workerSrc?: string;
  /**
   * pdf.js 资源基地址（cmaps / wasm / iccs / standard_fonts）。
   *
   * 默认按**运行时版本**推导官方 CDN 地址。内网部署可自托管这些目录后传入，
   * 例如 `pdfjs-dist` 包内的 `cmaps/`、`wasm/`、`iccs/`、`standard_fonts/`。
   */
  assetBaseUrl?: string;
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
      pdfjsSrc,
      workerSrc,
      assetBaseUrl,
      onPageChange,
      className,
      style,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
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
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
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

      const load = async () => {
        const pdfjs = await resolvePdfjs(pdfjsSrc);

        if (pdfjsSrc) {
          // 运行时加载的实例：
          // - 指定了 workerSrc → 独立线程；
          // - 否则从同一目录运行时取 worker 模块，走主线程（不经打包器）
          if (workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
          } else {
            const workerModule = await nativeImport<{
              WorkerMessageHandler?: unknown;
            }>(deriveWorkerUrl(pdfjsSrc));
            (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker =
              workerModule;
          }
        } else if (!hasExplicitWorkerSrc(workerSrc)) {
          // 未显式配置 worker 时走主线程渲染：零配置、无外部请求，且不受打包器影响
          await ensureMainThreadWorker();
        }

        // 显式传入全部资源地址：pdf.js 自行推导时会依赖被打包器改写的 import.meta.url
        const base = assetBaseUrl ?? defaultAssetBaseUrl(pdfjs);
        const withBase = (p: string) => (base ? `${base}${p}` : undefined);

        const loadingTask = pdfjs.getDocument({
          url,
          cMapUrl: withBase('cmaps/'),
          cMapPacked: true,
          wasmUrl: withBase('wasm/'),
          iccUrl: withBase('iccs/'),
          standardFontDataUrl: withBase('standard_fonts/'),
        });
        loadingTaskRef.current = loadingTask;
        return loadingTask.promise;
      };

      load()
        .then((doc) => {
          if (cancelled) {
            // 弹窗已关闭或 url 已变更，立即释放避免泄漏
            void loadingTaskRef.current?.destroy();
            loadingTaskRef.current = null;
            return;
          }
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
        loadingTaskRef.current?.destroy();
        loadingTaskRef.current = null;
      };
    }, [visible, url, assetBaseUrl, reloadToken, workerSrc, pdfjsSrc]);

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
          // 画布按设备像素比放大，避免高倍屏下模糊
          const dpr = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: scale * dpr, rotation });
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
          canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

          const task = page.render({ canvas, viewport });
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
        loadingTaskRef.current?.destroy();
        loadingTaskRef.current = null;
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
