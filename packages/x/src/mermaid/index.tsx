import React, { useCallback, useEffect, useRef, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import { CodeHighlighter } from '../code-highlighter';
import './index.less';

/**
 * mermaid 的配置项。
 *
 * 刻意不 `import type { MermaidConfig } from 'mermaid'`：mermaid 是**可选** peer
 * 依赖，若在类型层硬依赖它，未安装 mermaid 的消费方连 `import { Mermaid }`
 * 都会因找不到类型而编译失败——可选依赖必须做到类型层面也可选。
 */
export type MermaidConfig = Record<string, unknown>;

export interface MermaidActions {
  /** 显示放大 / 缩小按钮 @default true */
  enableZoom?: boolean;
  /** 显示下载 SVG 按钮 @default true */
  enableDownload?: boolean;
  /** 显示复制源码按钮 @default true */
  enableCopy?: boolean;
  /** 追加自定义操作节点 */
  customActions?: React.ReactNode;
}

export interface MermaidProps {
  /** mermaid 源码 */
  children?: string;
  /**
   * 头部内容：
   * - 不传：默认头部（图片 / 代码切换 + 操作按钮）
   * - `null`：不渲染头部
   * - 其他节点：完全自定义（此时不再渲染内置操作按钮）
   */
  header?: React.ReactNode | null;
  /**
   * mermaid 配置。**必须是引用稳定的对象**（`useMemo` / 模块常量），
   * 否则每次父组件重渲染都会重新初始化并重绘图表。
   */
  config?: MermaidConfig;
  actions?: MermaidActions;
  /** 渲染类型切换回调 */
  onRenderTypeChange?: (value: 'image' | 'code') => void;
  className?: string;
  style?: React.CSSProperties;
}

const SCALE_STEP = 0.2;
const SCALE_MIN = 0.4;
const SCALE_MAX = 3;

/** 默认配置：不自动扫描页面、安全级别 strict（对图表内的 HTML / 链接做净化） */
const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
};

/** mermaid 实例 id 需为 CSS 安全字符，故不用 useId（其返回值含冒号） */
let instanceSeq = 0;
const nextInstanceId = () => `aura-x-mermaid-${instanceSeq++}`;

interface MermaidRuntime {
  initialize: (config: MermaidConfig) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
}

/** 动态加载 mermaid：重依赖不进主包，未安装时才在运行到该组件时报错 */
async function loadMermaid(): Promise<MermaidRuntime> {
  try {
    const mod = (await import('mermaid')) as unknown as {
      default?: MermaidRuntime;
    } & MermaidRuntime;
    return mod.default ?? mod;
  } catch {
    throw new Error('未安装 mermaid：请先 `pnpm add mermaid` 再使用 <Mermaid />');
  }
}

/**
 * Mermaid — 图表。
 *
 * 把 mermaid 源码渲染为 SVG，并提供图片 / 代码双视图、缩放、重置、下载与复制。
 * mermaid 通过动态 `import()` 按需加载，因此不装它也不会拖累主包体积。
 */
export const Mermaid: React.FC<MermaidProps> = ({
  children,
  header,
  config,
  actions,
  onRenderTypeChange,
  className,
  style,
}) => {
  const code = children ?? '';
  const [instanceId] = useState(nextInstanceId);
  const [view, setView] = useState<'image' | 'code'>('image');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);
  const renderSeq = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const seq = ++renderSeq.current;
    const isCurrent = () => !cancelled && seq === renderSeq.current;

    setStatus('loading');
    setError('');

    (async () => {
      let runtime: MermaidRuntime;
      try {
        runtime = await loadMermaid();
      } catch (loadError) {
        if (!isCurrent()) return;
        setError((loadError as Error).message);
        setStatus('error');
        return;
      }

      try {
        runtime.initialize({ ...DEFAULT_CONFIG, ...config });
        const { svg: output } = await runtime.render(
          `${instanceId}-${seq}`,
          code,
        );
        if (!isCurrent()) return;
        setSvg(output);
        setStatus('ready');
      } catch (renderError) {
        if (!isCurrent()) return;
        // 语法错误等：保留错误信息，同时把代码视图作为兜底呈现
        setError(
          renderError instanceof Error ? renderError.message : String(renderError),
        );
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, config, instanceId]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const changeView = useCallback(
    (next: 'image' | 'code') => {
      setView(next);
      onRenderTypeChange?.(next);
    },
    [onRenderTypeChange],
  );

  const zoom = useCallback((delta: number) => {
    setScale((prev) =>
      Math.min(SCALE_MAX, Math.max(SCALE_MIN, Number((prev + delta).toFixed(2)))),
    );
  }, []);

  const handleDownload = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${instanceId}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [svg, instanceId]);

  const handleCopy = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('clipboard unavailable');
      }
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const showZoom = actions?.enableZoom !== false;
  const showDownload = actions?.enableDownload !== false;
  const showCopy = actions?.enableCopy !== false;

  const defaultHeader = (
    <div className={prefixCls('x-mermaid-header')}>
      <div
        className={prefixCls('x-mermaid-views')}
        role="group"
        aria-label="渲染视图切换"
      >
        {(
          [
            ['image', '图片'],
            ['code', '代码'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={classNames(
              prefixCls('x-mermaid-view-btn'),
              view === value && prefixCls('x-mermaid-view-btn--active'),
            )}
            aria-pressed={view === value}
            onClick={() => changeView(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={prefixCls('x-mermaid-actions')}>
        {showZoom ? (
          <>
            <button
              type="button"
              className={prefixCls('x-mermaid-action')}
              aria-label="放大"
              disabled={scale >= SCALE_MAX}
              onClick={() => zoom(SCALE_STEP)}
            >
              ＋
            </button>
            <button
              type="button"
              className={prefixCls('x-mermaid-action')}
              aria-label="缩小"
              disabled={scale <= SCALE_MIN}
              onClick={() => zoom(-SCALE_STEP)}
            >
              －
            </button>
            <button
              type="button"
              className={prefixCls('x-mermaid-action')}
              aria-label="重置缩放"
              onClick={() => setScale(1)}
            >
              重置
            </button>
          </>
        ) : null}
        {showCopy ? (
          <button
            type="button"
            className={prefixCls('x-mermaid-action')}
            aria-label={copied ? '已复制' : '复制源码'}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制'}
          </button>
        ) : null}
        {showDownload ? (
          <button
            type="button"
            className={prefixCls('x-mermaid-action')}
            aria-label="下载 SVG"
            disabled={!svg}
            onClick={handleDownload}
          >
            下载
          </button>
        ) : null}
        {actions?.customActions}
      </div>
    </div>
  );

  const resolvedHeader = header === null ? null : (header ?? defaultHeader);

  return (
    <div
      className={classNames(prefixCls('x-mermaid'), className)}
      style={style}
    >
      {resolvedHeader}
      <div
        className={classNames(
          prefixCls('x-mermaid-body'),
          view === 'code' && prefixCls('x-mermaid-body--code'),
        )}
      >
        {view === 'code' ? (
          <CodeHighlighter lang="mermaid">{code}</CodeHighlighter>
        ) : status === 'error' ? (
          <div className={prefixCls('x-mermaid-error')} role="alert">
            <p className={prefixCls('x-mermaid-error-title')}>图表渲染失败</p>
            <pre className={prefixCls('x-mermaid-error-detail')}>{error}</pre>
          </div>
        ) : status === 'loading' ? (
          <div className={prefixCls('x-mermaid-loading')} aria-busy="true">
            正在渲染图表…
          </div>
        ) : (
          <div className={prefixCls('x-mermaid-graph')}>
            <div
              className={prefixCls('x-mermaid-canvas')}
              style={{ transform: `scale(${scale})` }}
              // mermaid 在本机按源码生成 SVG；安全级别已固定为 strict（净化内联
              // HTML 与链接协议），注入面与直接用 mermaid 渲染一致。
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

Mermaid.displayName = 'Mermaid';
