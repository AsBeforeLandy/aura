import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';

interface ThemeBlock {
  selector: string;
  vars: Record<string, string>;
}

/** 按顶层 { ... } 块解析 CSS，返回每块的 selector 列表与 CSS 变量。
 *  值中不含 '}'（linear-gradient / cubic-bezier 均以 ')' 收尾），可安全按 '}' 分块。 */
function parseBlocks(css: string): ThemeBlock[] {
  const blocks: ThemeBlock[] = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    // selector 可能混入前导块注释（文件头说明），剥掉后再精确比较
    const selector = css
      .slice(i, open)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    const close = css.indexOf('}', open);
    const body = css.slice(open + 1, close);
    const vars: Record<string, string> = {};
    const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
    let v;
    while ((v = varRegex.exec(body)) !== null) {
      vars[v[1]] = v[2].trim();
    }
    blocks.push({ selector, vars });
    i = close + 1;
  }
  return blocks;
}

/** 取 selector（可以是选择器列表中的一项）命中块的全部变量，多块合并 */
function getVars(
  blocks: ThemeBlock[],
  selector: string,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const block of blocks) {
    const parts = block.selector.split(',').map((s) => s.trim());
    if (parts.includes(selector)) {
      Object.assign(vars, block.vars);
    }
  }
  return vars;
}

const PRIMARY_STEPS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
];

// 派生令牌：换主色必须同步覆盖（docs/guide/theme.md 红线）
const DERIVED_KEYS = [
  'aura-selection-bg',
  'aura-shadow-glow',
  'aura-x-accent',
  'aura-x-accent-soft',
  'aura-x-accent-gradient',
  'aura-x-glow',
  'aura-x-focus-ring',
  'aura-x-bubble-ai-bg',
  'aura-x-bubble-user-bg',
  'aura-x-bubble-user-text',
  'aura-x-bubble-border',
  'aura-x-code-bg',
  'aura-x-stage-bg',
  'aura-x-glass-blur',
];

describe('tokens.css', () => {
  let css: string;
  let blocks: ThemeBlock[];

  beforeAll(() => {
    css = fs.readFileSync(path.resolve(__dirname, './tokens.css'), 'utf-8');
    blocks = parseBlocks(css);
  });

  describe('default theme (light × violet)', () => {
    it('should have :root with violet light variables and neutral tokens', () => {
      const vars = getVars(blocks, ':root');
      expect(vars['aura-primary-700']).toBe('#7c3aed');
      expect(vars['aura-bg']).toBe('#ffffff');
      expect(vars['aura-radius-md']).toBe('10px');
      expect(vars['aura-spacing-4']).toBe('16px');
    });
  });

  describe('dark × violet', () => {
    it('should keep the legacy [data-theme="dark"] selector working', () => {
      const legacy = getVars(blocks, '[data-theme="dark"]');
      expect(legacy['aura-primary-700']).toBe('#c4b5fd');
      expect(legacy['aura-bg']).toBe('#0f0c29');
    });
  });

  describe('light × ocean', () => {
    it('should use Tailwind blue-600 as the primary anchor', () => {
      const vars = getVars(blocks, '[data-palette="ocean"]');
      expect(vars['aura-primary-700']).toBe('#2563eb');
      expect(vars['aura-bg']).toBe('#ffffff');
      expect(vars['aura-gray-900']).toBe('#0f172a');
    });
  });

  describe('dark × ocean', () => {
    it('should invert the primary ramp on deep navy background', () => {
      const vars = getVars(blocks, '[data-mode="dark"][data-palette="ocean"]');
      expect(vars['aura-primary-700']).toBe('#93c5fd');
      expect(vars['aura-bg']).toBe('#0b1120');
    });
  });

  describe('light × sunset', () => {
    it('should shift warning/error to avoid clashing with the orange primary', () => {
      const vars = getVars(blocks, '[data-palette="sunset"]');
      expect(vars['aura-primary-700']).toBe('#ea580c');
      expect(vars['aura-warning']).toBe('#ca8a04');
      expect(vars['aura-error']).toBe('#dc2626');
      expect(vars['aura-gray-900']).toBe('#1c1917');
    });
  });

  describe('dark × sunset', () => {
    it('should invert the primary ramp on warm dark background', () => {
      const vars = getVars(blocks, '[data-mode="dark"][data-palette="sunset"]');
      expect(vars['aura-primary-700']).toBe('#fdba74');
      expect(vars['aura-bg']).toBe('#191210');
    });
  });

  describe('palette completeness', () => {
    const palettes = [
      '[data-palette="ocean"]',
      '[data-mode="dark"][data-palette="ocean"]',
      '[data-palette="sunset"]',
      '[data-mode="dark"][data-palette="sunset"]',
    ];

    it.each(palettes)(
      '%s should cover the full primary ramp and all derived tokens',
      (selector) => {
        const vars = getVars(blocks, selector);
        for (const step of PRIMARY_STEPS) {
          expect(
            vars[`aura-primary-${step}`],
            `${selector} --aura-primary-${step}`,
          ).toBeDefined();
        }
        for (const key of DERIVED_KEYS) {
          expect(vars[key], `${selector} --${key}`).toBeDefined();
        }
      },
    );
  });
});
