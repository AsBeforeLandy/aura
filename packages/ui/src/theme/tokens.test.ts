import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';

function parseCSSVariables(css: string, selector: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const regex = new RegExp(
    `${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`,
    's',
  );
  const match = css.match(regex);
  if (!match) return vars;
  const decls = match[1];
  const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
  let m;
  while ((m = varRegex.exec(decls)) !== null) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

describe('tokens.css', () => {
  let css: string;

  beforeAll(() => {
    css = fs.readFileSync(path.resolve(__dirname, './tokens.css'), 'utf-8');
  });

  it('should have :root with light theme variables', () => {
    const vars = parseCSSVariables(css, ':root');
    expect(vars['aura-primary-700']).toBe('#7c3aed');
    expect(vars['aura-radius-md']).toBe('10px');
    expect(vars['aura-spacing-4']).toBe('16px');
  });

  it('should have [data-theme="dark"] with dark theme overrides', () => {
    const vars = parseCSSVariables(css, '[data-theme="dark"]');
    expect(vars['aura-primary-700']).toBeDefined();
    expect(vars['aura-bg']).toBeDefined();
  });
});
