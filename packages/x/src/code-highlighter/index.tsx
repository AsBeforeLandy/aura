import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Highlight } from 'prism-react-renderer';
import type { Language } from 'prism-react-renderer';
import { classNames, prefixCls } from '@aura/shared';
import { auraCodeTheme } from './prism-theme';
import './index.less';

/** 复制按钮的成功态展示时长 */
const COPIED_RESET_DELAY = 1500;

export interface CodeHighlighterProps {
  /**
   * 代码语言。prism-react-renderer 内置语言（js / ts / tsx / jsx / json /
   * bash / css / html / python / go / sql / yaml 等）会着色；
   * 未内置的语言安全回退为纯文本，不会报错。
   * @default 'text'
   */
  lang?: string;
  /** 代码内容 */
  children?: string;
  /**
   * 头部内容：
   * - 不传：渲染默认头部（语言名 + 复制按钮）
   * - `false`：不渲染头部
   * - 函数：`({ lang, code }) => ReactNode | false`，返回 `false` 同样不渲染
   */
  header?:
    | React.ReactNode
    | ((info: { lang: string; code: string }) => React.ReactNode | false)
    | false;
  /** 复制成功后的提示文案 @default '已复制' */
  copiedText?: string;
  /** 复制成功回调 */
  onCopy?: (code: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CodeHighlighterRef {
  /** 根节点 DOM */
  nativeElement: HTMLDivElement | null;
}

/** 复制图标（继承 currentColor） */
const CopyGlyph: React.FC = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
  </svg>
);

/**
 * 复制文本：优先 Clipboard API，不可用时（非安全上下文）回退到
 * 临时 textarea + `document.execCommand`。
 */
async function writeToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (typeof document === 'undefined') throw new Error('clipboard unavailable');

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    const ok = document.execCommand('copy');
    if (!ok) throw new Error('execCommand copy returned false');
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * CodeHighlighter — 代码高亮。
 *
 * 基于 `prism-react-renderer`：等宽字体 + 语法着色 + 头部语言标识与一键复制。
 * 配色走 `var(--aura-*)` 令牌，亮暗主题自动跟随，无需传入主题对象。
 */
export const CodeHighlighter = forwardRef<
  CodeHighlighterRef,
  CodeHighlighterProps
>(
  (
    {
      lang = 'text',
      children,
      header,
      copiedText = '已复制',
      onCopy,
      className,
      style,
    },
    ref,
  ) => {
    const code = children ?? '';
    const rootRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);
    const [copied, setCopied] = useState(false);

    // 不定依赖数组：每次提交都重新取根节点，避免 ref 晚挂载时拿到 null
    useImperativeHandle(ref, () => ({ nativeElement: rootRef.current }));

    // 卸载时清掉未完成的成功态定时器，避免对已卸载组件 setState
    useEffect(
      () => () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      },
      [],
    );

    const handleCopy = useCallback(async () => {
      try {
        await writeToClipboard(code);
      } catch {
        // 复制失败（权限 / 非安全上下文）：保持原状，不打断阅读
        return;
      }
      setCopied(true);
      onCopy?.(code);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(
        () => setCopied(false),
        COPIED_RESET_DELAY,
      );
    }, [code, onCopy]);

    const resolvedHeader = (() => {
      if (header === false) return null;
      if (typeof header === 'function') {
        const custom = header({ lang, code });
        return custom === false ? null : custom;
      }
      if (header !== undefined) return header;

      return (
        <div className={prefixCls('x-code-highlighter-header')}>
          <span className={prefixCls('x-code-highlighter-lang')}>{lang}</span>
          <button
            type="button"
            className={prefixCls('x-code-highlighter-copy')}
            onClick={handleCopy}
            aria-label={copied ? copiedText : '复制代码'}
          >
            <CopyGlyph />
            <span>{copied ? copiedText : '复制'}</span>
          </button>
        </div>
      );
    })();

    return (
      <div
        ref={rootRef}
        className={classNames(prefixCls('x-code-highlighter'), className)}
        style={style}
      >
        {resolvedHeader}
        <Highlight
          theme={auraCodeTheme}
          code={code}
          language={lang.toLowerCase() as Language}
        >
          {({
            className: prismClassName,
            style: prismStyle,
            tokens,
            getLineProps,
            getTokenProps,
          }) => (
            <pre
              className={classNames(
                prefixCls('x-code-highlighter-pre'),
                prismClassName,
              )}
              style={prismStyle}
            >
              <code>
                {tokens.map((line, lineIndex) => {
                  const lineProps = getLineProps({ line });
                  return (
                    // 行用 block 的 <span> 而非 <div>：<pre> / <code> 的内容模型
                    // 只接受短语内容，塞 div 是无效 HTML（读屏与结构校验都会报）
                    <span
                      key={lineIndex}
                      {...lineProps}
                      className={classNames(
                        prefixCls('x-code-highlighter-line'),
                        lineProps.className,
                      )}
                    >
                      {line.map((token, tokenIndex) => (
                        <span key={tokenIndex} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  );
                })}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    );
  },
);

CodeHighlighter.displayName = 'CodeHighlighter';
