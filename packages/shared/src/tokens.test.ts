import { describe, it, expect } from 'vitest';
import { auraTokens, generateCSSVariables } from './tokens';

describe('auraTokens', () => {
  it('should have primary color scale 50-950', () => {
    const scales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    for (const i of scales) {
      expect(auraTokens.colors.primary[i]).toBeDefined();
    }
  });

  it('should have gray color scale 50-950', () => {
    const scales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    for (const i of scales) {
      expect(auraTokens.colors.gray[i]).toBeDefined();
    }
  });

  it('should have semantic colors', () => {
    expect(auraTokens.colors.success).toBeDefined();
    expect(auraTokens.colors.warning).toBeDefined();
    expect(auraTokens.colors.error).toBeDefined();
    expect(auraTokens.colors.info).toBeDefined();
  });

  it('should have spacing scale 1-12', () => {
    expect(auraTokens.spacing[1]).toBe(4);
    expect(auraTokens.spacing[12]).toBe(48);
  });

  it('should have radius tokens', () => {
    expect(auraTokens.radius.sm).toBe('6px');
    expect(auraTokens.radius.md).toBe('10px');
    expect(auraTokens.radius.lg).toBe('14px');
    expect(auraTokens.radius.xl).toBe('20px');
    expect(auraTokens.radius.full).toBe('9999px');
  });

  it('should have shadow tokens including glow', () => {
    expect(auraTokens.shadow.sm).toBeDefined();
    expect(auraTokens.shadow.md).toBeDefined();
    expect(auraTokens.shadow.lg).toBeDefined();
    expect(auraTokens.shadow.glow).toContain('rgba(124,58,237');
  });

  it('should have font size tokens', () => {
    expect(auraTokens.fontSize.xs).toBe('12px');
    expect(auraTokens.fontSize.md).toBe('14px');
  });

  it('should have duration tokens', () => {
    expect(auraTokens.duration.fast).toBe('150ms');
    expect(auraTokens.duration.normal).toBe('200ms');
    expect(auraTokens.duration.slow).toBe('300ms');
  });
});

describe('generateCSSVariables', () => {
  it('should generate --aura-prefixed CSS variable declarations', () => {
    const css = generateCSSVariables();
    expect(css).toContain('--aura-primary-50');
    expect(css).toContain('--aura-primary-950');
    expect(css).toContain('--aura-spacing-1');
    expect(css).toContain('--aura-radius-md');
    expect(css).toContain('--aura-shadow-glow');
  });

  it('should wrap in :root selector', () => {
    const css = generateCSSVariables();
    expect(css).toContain(':root');
  });
});
