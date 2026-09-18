import ReactMarkdown from 'react-markdown';
import { classNames, prefixCls } from '@aura/shared';
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

export interface MarkdownContentProps {
  /**
   * Markdown 文本。流式过程中传入未闭合的语法也可以——remark 按块级容错渲染，
   * 收到新内容后重新渲染即可（打字机场景）。
   */
  children?: string;
  className?: string;
}

/**
 * MarkdownContent — Bubble 的可选内容渲染器。
 *
 * 基于 react-markdown（@aura/x 的可选 peer 依赖）。安全默认值：
 * 1. **不渲染原始 HTML**（未接入 rehype-raw，HTML 标签按纯文本展示）；
 * 2. 链接协议白名单：仅放行 `http` / `https` / `mailto`，其余清洗为空；
 * 3. 外链统一 `target="_blank" rel="noreferrer"`；代码块纯展示、不执行。
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  children,
  className,
}) => (
  <div className={classNames(prefixCls('x-markdown'), className)}>
    <ReactMarkdown
      urlTransform={safeUrlTransform}
      components={{
        a: ({ node, ...rest }) => (
          <a {...rest} target="_blank" rel="noreferrer" />
        ),
      }}
    >
      {children ?? ''}
    </ReactMarkdown>
  </div>
);

MarkdownContent.displayName = 'MarkdownContent';
