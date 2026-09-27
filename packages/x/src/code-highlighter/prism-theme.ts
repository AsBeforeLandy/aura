import type { PrismTheme } from 'prism-react-renderer';

/**
 * Aura 代码高亮主题。
 *
 * 与 antdx 的差异：**不绑定某一套亮/暗主题**，而是把 token 颜色写成
 * `var(--aura-*)` 引用。prism-react-renderer 只是把这些值塞进行内 `style`，
 * 浏览器解析时仍会走 CSS 变量，于是主题切换（`data-theme`）自动生效，
 * 无需在 JS 侧判断明暗、也不需要维护两份配色表。
 *
 * 颜色取语义令牌而非硬编码色值，与 `MarkdownContent` 的代码块观感保持一致
 * （底色同为 `--aura-x-code-bg`，字体栈同为 ui-monospace 一系）。
 */
export const auraCodeTheme: PrismTheme = {
  plain: {
    color: 'var(--aura-text)',
    backgroundColor: 'transparent',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--aura-text-tertiary)', fontStyle: 'italic' },
    },
    {
      types: ['punctuation'],
      style: { color: 'var(--aura-text-secondary)' },
    },
    {
      types: ['namespace'],
      style: { opacity: 0.7 },
    },
    {
      types: ['tag', 'constant', 'symbol', 'deleted'],
      style: { color: 'var(--aura-error)' },
    },
    {
      types: ['property', 'attr-name'],
      style: { color: 'var(--aura-primary-700)' },
    },
    {
      types: ['boolean', 'number'],
      style: { color: 'var(--aura-primary-600)' },
    },
    {
      types: [
        'selector',
        'string',
        'char',
        'builtin',
        'inserted',
        'attr-value',
      ],
      style: { color: 'var(--aura-success)' },
    },
    {
      types: ['operator', 'entity', 'url'],
      style: { color: 'var(--aura-text-secondary)' },
    },
    {
      types: ['atrule', 'keyword'],
      style: { color: 'var(--aura-primary-700)', fontWeight: '600' },
    },
    {
      types: ['function', 'class-name'],
      style: { color: 'var(--aura-info)' },
    },
    {
      types: ['regex', 'important', 'variable'],
      style: { color: 'var(--aura-warning)' },
    },
  ],
};
