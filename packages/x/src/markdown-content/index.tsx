import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import { CodeHighlighter } from '../code-highlighter';
import './index.less';

/** 链接协议白名单：之外的协议一律清洗为空串（react-markdown 会移除 href） */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

function safeUrlTransform(url: string): string {
  try {
    const { protocol } = new URL(url, 'https://aura.local');
    return SAFE_PROTOCOLS.includes(protocol) ? url : '';
  } catch {
    return '';
  }
}

/** 围栏代码块的 `language-xxx` 类名 → 语言标识 */
function parseLang(className: unknown): string | undefined {
  if (typeof className !== 'string') return undefined;
  return /language-(\S+)/.exec(className)?.[1];
}

/** 把 React 子树压成纯文本（代码块内容通常是字符串，这里兜住数组/数字等形态） */
function toPlainText(value: React.ReactNode): string {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(toPlainText).join('');
  return '';
}

export interface MarkdownContentProps {
  /**
   * Markdown 文本。流式过程中传入未闭合的语法也可以——remark 按块级容错渲染，
   * 收到新内容后重新渲染即可（打字机场景）。
   */
  children?: string;
  /**
   * 围栏代码块是否交给 [`CodeHighlighter`](/x-components/code-highlighter) 渲染
   * （语法着色 + 语言标识 + 一键复制）。设为 `false` 回到朴素的 `pre > code`。
   * @default true
   */
  highlightCode?: boolean;
  /**
   * 完全自定义代码块渲染，优先级高于 `highlightCode`。
   * 返回的节点会**直接取代** `<pre>` 本身，因此需要自行负责包裹与样式。
   */
  renderCode?: (info: { lang: string; code: string }) => React.ReactNode;
  className?: string;
}

/**
 * MarkdownContent — Bubble 的可选内容渲染器。
 *
 * 基于 react-markdown（`@aura-react-comp/x` 的运行时依赖，随包自动安装）。
 * 安全默认值：
 * 1. **不渲染原始 HTML**（未接入 rehype-raw，HTML 标签按纯文本展示）；
 * 2. 链接协议白名单：仅放行 `http` / `https` / `mailto`，其余清洗为空；
 * 3. 外链统一 `target="_blank" rel="noreferrer"`；
 * 4. 围栏代码块**只做语法着色，从不执行**——代码内容始终作为文本渲染。
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  children,
  highlightCode = true,
  renderCode,
  className,
}) => {
  const components = useMemo<Components>(
    () => ({
      a: ({ node, ...rest }) => <a {...rest} target="_blank" rel="noreferrer" />,

      // 行内代码走这里；围栏代码块交给下面的 pre 覆写统一处理
      code: ({ node, ...rest }) => <code {...rest} />,

      /**
       * 覆写 `pre` 而不是 `code`，是因为围栏代码块在 hast 里是
       * `pre > code`：若在 `code` 里返回一个 `<div>`（CodeHighlighter 的根），
       * 就会形成 `<pre><div>` 这种非法嵌套。这里直接替换掉 `pre` 本身，
       * 既能拿到子元素的 language 类名，也不必再渲染那层 `code`。
       */
      pre: ({ node, children, ...rest }) => {
        const child = React.Children.toArray(children)[0];
        if (!React.isValidElement(child)) {
          return <pre {...rest}>{children}</pre>;
        }

        const {
          className: codeClassName,
          children: codeChildren,
        } = child.props as { className?: string; children?: React.ReactNode };
        const lang = parseLang(codeClassName) ?? 'text';
        // react-markdown 传来的代码内容带尾随换行；留着它会让代码块末尾多出一条
        // 空白行（单行代码渲染成 2 行）。展示与复制都不需要它，统一去掉一个。
        const code = toPlainText(codeChildren).replace(/\n$/, '');

        if (renderCode) return <>{renderCode({ lang, code })}</>;
        if (!highlightCode) return <pre {...rest}>{children}</pre>;

        return <CodeHighlighter lang={lang}>{code}</CodeHighlighter>;
      },
    }),
    [highlightCode, renderCode],
  );

  return (
    <div className={classNames(prefixCls('x-markdown'), className)}>
      <ReactMarkdown urlTransform={safeUrlTransform} components={components}>
        {children ?? ''}
      </ReactMarkdown>
    </div>
  );
};

MarkdownContent.displayName = 'MarkdownContent';
