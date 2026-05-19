import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Typography, Title, Text, Paragraph } from './index';

describe('Typography', () => {
  /* ===== Title ===== */
  describe('Title', () => {
    it('should render children', () => {
      const { getByText } = render(<Title>Hello</Title>);
      expect(getByText('Hello')).toBeDefined();
    });

    it('should render h1 by default (level=1)', () => {
      const { container } = render(<Title>Hello</Title>);
      expect(container.querySelector('h1')).not.toBeNull();
      expect(container.querySelector('h1')!.classList.contains('aura-typography-title')).toBe(true);
      expect(container.querySelector('h1')!.classList.contains('aura-typography-title-1')).toBe(true);
    });

    it('should render h3 for level=3', () => {
      const { container } = render(<Title level={3}>Sub</Title>);
      expect(container.querySelector('h3')).not.toBeNull();
      expect(container.querySelector('h3')!.classList.contains('aura-typography-title-3')).toBe(true);
    });

    it('should render h5 for level=5', () => {
      const { container } = render(<Title level={5}>Small</Title>);
      expect(container.querySelector('h5')).not.toBeNull();
    });

    it('should merge className', () => {
      const { container } = render(<Title className="custom">Test</Title>);
      const el = container.querySelector('h1')!;
      expect(el.classList.contains('custom')).toBe(true);
    });
  });

  /* ===== Text ===== */
  describe('Text', () => {
    it('should render children', () => {
      const { getByText } = render(<Text>Hello</Text>);
      expect(getByText('Hello')).toBeDefined();
    });

    it('should render span with base class', () => {
      const { container } = render(<Text>Hi</Text>);
      const span = container.querySelector('span')!;
      expect(span.classList.contains('aura-typography-text')).toBe(true);
    });

    it('should apply variant class', () => {
      const { container } = render(<Text variant="danger">Error</Text>);
      const span = container.querySelector('span')!;
      expect(span.classList.contains('aura-typography-text-danger')).toBe(true);
    });

    it('should not add variant class for default', () => {
      const { container } = render(<Text variant="default">Plain</Text>);
      const span = container.querySelector('span')!;
      expect(span.classList.contains('aura-typography-text-default')).toBe(false);
    });

    it('should apply strong modifier', () => {
      const { container } = render(<Text strong>Bold</Text>);
      expect(container.querySelector('span')!.classList.contains('aura-typography-text-strong')).toBe(true);
    });

    it('should apply underline modifier', () => {
      const { container } = render(<Text underline>Line</Text>);
      expect(container.querySelector('span')!.classList.contains('aura-typography-text-underline')).toBe(true);
    });

    it('should apply code modifier', () => {
      const { container } = render(<Text code>Code</Text>);
      expect(container.querySelector('span')!.classList.contains('aura-typography-text-code')).toBe(true);
    });

    it('should apply mark modifier', () => {
      const { container } = render(<Text mark>Mark</Text>);
      expect(container.querySelector('span')!.classList.contains('aura-typography-text-mark')).toBe(true);
    });

    it('should wrap in del when delete prop is true', () => {
      const { container } = render(<Text delete>Deleted</Text>);
      expect(container.querySelector('del')).not.toBeNull();
    });

    it('should support all variants', () => {
      const variants = ['default', 'secondary', 'success', 'warning', 'danger'] as const;
      variants.forEach((variant) => {
        const { unmount, container } = render(<Text variant={variant}>{variant}</Text>);
        const span = container.querySelector('span')!;
        expect(span.classList.contains('aura-typography-text')).toBe(true);
        if (variant !== 'default') {
          expect(span.classList.contains(`aura-typography-text-${variant}`)).toBe(true);
        }
        unmount();
      });
    });
  });

  /* ===== Paragraph ===== */
  describe('Paragraph', () => {
    it('should render children', () => {
      const { getByText } = render(<Paragraph>Content</Paragraph>);
      expect(getByText('Content')).toBeDefined();
    });

    it('should render p element with base class', () => {
      const { container } = render(<Paragraph>P</Paragraph>);
      const p = container.querySelector('p')!;
      expect(p.classList.contains('aura-typography-paragraph')).toBe(true);
    });

    it('should apply ellipsis class', () => {
      const { container } = render(<Paragraph ellipsis>Long</Paragraph>);
      expect(container.querySelector('p')!.classList.contains('aura-typography-paragraph-ellipsis')).toBe(true);
    });
  });

  /* ===== Typography 复合组件 ===== */
  describe('Typography compound', () => {
    it('should expose Title, Text, Paragraph on Typography object', () => {
      expect(Typography.Title).toBe(Title);
      expect(Typography.Text).toBe(Text);
      expect(Typography.Paragraph).toBe(Paragraph);
    });

    it('should render Typography wrapper with children', () => {
      const { getByText } = render(
        <Typography>
          <Typography.Title>Header</Typography.Title>
        </Typography>,
      );
      expect(getByText('Header')).toBeDefined();
    });

    it('should render Typography with base class', () => {
      const { container } = render(<Typography>Wrap</Typography>);
      expect(container.querySelector('span')!.classList.contains('aura-typography')).toBe(true);
    });
  });
});
