import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { motionDurations, motionDistances, motionEases } from './tokens';

const dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(dir, 'tokens.css'), 'utf8');

describe('动效令牌双端一致性（tokens.ts ↔ tokens.css）', () => {
  it.each(Object.entries(motionDurations))(
    'duration %s 在 CSS 中为对应毫秒值',
    (name, seconds) => {
      const ms = Math.round(seconds * 1000);
      expect(css).toContain(`--aura-motion-duration-${name}: ${ms}ms`);
    },
  );

  it.each(Object.entries(motionEases))(
    'ease %s 的 cubic-bezier 双端一致',
    (name, points) => {
      expect(css).toContain(
        `--aura-motion-ease-${name}: cubic-bezier(${points.join(', ')})`,
      );
    },
  );

  it.each(Object.entries(motionDistances))(
    'distance %s 在 CSS 中为对应像素值',
    (name, px) => {
      expect(css).toContain(`--aura-motion-distance-${name}: ${px}px`);
    },
  );

  it('CSS 令牌包含 reduced-motion 降级块（可访问性第一层）', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('--aura-motion-duration-normal: 0ms');
  });
});
