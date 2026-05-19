import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Card } from './index';

describe('Card', () => {
  // ===== 基础渲染 =====
  it('should render with default props', () => {
    const { container } = render(<Card>卡片内容</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.classList.contains('aura-card')).toBe(true);
    expect(card.classList.contains('aura-card-md')).toBe(true);
    expect(screen.getByText('卡片内容')).toBeDefined();
  });

  it('should render children', () => {
    render(<Card><span>子内容</span></Card>);
    expect(screen.getByText('子内容')).toBeDefined();
  });

  // ===== Variant =====
  it('should apply variant className', () => {
    const variants = ['default', 'elevated', 'outlined', 'glass'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(<Card variant={variant}>内容</Card>);
      const card = container.firstChild as HTMLElement;
      if (variant !== 'default') {
        expect(card.classList.contains(`aura-card-${variant}`)).toBe(true);
      }
      unmount();
    });
  });

  // ===== Size =====
  it('should apply size className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount, container } = render(<Card size={size}>内容</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.classList.contains(`aura-card-${size}`)).toBe(true);
      unmount();
    });
  });

  // ===== Hoverable =====
  it('should apply hoverable className', () => {
    const { container } = render(<Card hoverable>内容</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.classList.contains('aura-card-hoverable')).toBe(true);
  });

  it('should not apply hoverable className by default', () => {
    const { container } = render(<Card>内容</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.classList.contains('aura-card-hoverable')).toBe(false);
  });

  // ===== Loading =====
  it('should render skeleton when loading', () => {
    const { container } = render(<Card loading>内容</Card>);
    // 内容不应显示
    expect(screen.queryByText('内容')).toBeNull();
    // 骨架屏应显示
    const skeleton = container.querySelector('.aura-card-skeleton');
    expect(skeleton).not.toBeNull();
  });

  // ===== Custom className & style =====
  it('should apply custom className and style', () => {
    const { container } = render(
      <Card className="custom-card" style={{ maxWidth: 400 }}>
        内容
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.classList.contains('custom-card')).toBe(true);
    expect((card as HTMLElement).style.maxWidth).toBe('400px');
  });

  // ===== forwardRef =====
  it('should forward ref to card div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>内容</Card>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.classList.contains('aura-card')).toBe(true);
  });
});

describe('Card.Header', () => {
  it('should render header with className', () => {
    const { container } = render(
      <Card>
        <Card.Header className="my-header">标题栏</Card.Header>
      </Card>,
    );
    const header = container.querySelector('.aura-card-header');
    expect(header).not.toBeNull();
    expect(header?.classList.contains('my-header')).toBe(true);
    expect(screen.getByText('标题栏')).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(Card.Header.displayName).toBe('Card.Header');
  });
});

describe('Card.Title', () => {
  it('should render title with className', () => {
    const { container } = render(
      <Card>
        <Card.Title className="my-title">标题</Card.Title>
      </Card>,
    );
    const title = container.querySelector('.aura-card-title');
    expect(title).not.toBeNull();
    expect(title?.classList.contains('my-title')).toBe(true);
  });

  it('should have correct displayName', () => {
    expect(Card.Title.displayName).toBe('Card.Title');
  });
});

describe('Card.Body', () => {
  it('should render body with className', () => {
    const { container } = render(
      <Card>
        <Card.Body className="my-body">正文</Card.Body>
      </Card>,
    );
    const body = container.querySelector('.aura-card-body');
    expect(body).not.toBeNull();
    expect(body?.classList.contains('my-body')).toBe(true);
  });

  it('should have correct displayName', () => {
    expect(Card.Body.displayName).toBe('Card.Body');
  });
});

describe('Card.Actions', () => {
  it('should render actions area', () => {
    const { container } = render(
      <Card>
        <Card.Actions>
          <button>操作</button>
        </Card.Actions>
      </Card>,
    );
    const actions = container.querySelector('.aura-card-actions');
    expect(actions).not.toBeNull();
    expect(screen.getByText('操作')).toBeDefined();
  });

  it('should have correct displayName', () => {
    expect(Card.Actions.displayName).toBe('Card.Actions');
  });
});

describe('Card.Footer', () => {
  it('should render footer with className', () => {
    const { container } = render(
      <Card>
        <Card.Footer className="my-footer">页脚</Card.Footer>
      </Card>,
    );
    const footer = container.querySelector('.aura-card-footer');
    expect(footer).not.toBeNull();
    expect(footer?.classList.contains('my-footer')).toBe(true);
  });

  it('should have correct displayName', () => {
    expect(Card.Footer.displayName).toBe('Card.Footer');
  });
});

describe('Card.Cover', () => {
  it('should render cover area', () => {
    const { container } = render(
      <Card>
        <Card.Cover>
          <img src="test.jpg" alt="封面" />
        </Card.Cover>
      </Card>,
    );
    const cover = container.querySelector('.aura-card-cover');
    expect(cover).not.toBeNull();
    expect(container.querySelector('img')?.alt).toBe('封面');
  });

  it('should have correct displayName', () => {
    expect(Card.Cover.displayName).toBe('Card.Cover');
  });
});

describe('Card composition', () => {
  it('should compose all sub-components together', () => {
    const { container } = render(
      <Card variant="elevated" hoverable>
        <Card.Cover>
          <img src="test.jpg" alt="封面" />
        </Card.Cover>
        <Card.Header>
          <Card.Title>组合标题</Card.Title>
        </Card.Header>
        <Card.Body>组合正文内容</Card.Body>
        <Card.Actions>
          <button>确认</button>
          <button>取消</button>
        </Card.Actions>
        <Card.Footer>更新于 2024</Card.Footer>
      </Card>,
    );

    expect(container.querySelector('.aura-card-elevated')).not.toBeNull();
    expect(container.querySelector('.aura-card-hoverable')).not.toBeNull();
    expect(screen.getByText('组合标题')).toBeDefined();
    expect(screen.getByText('组合正文内容')).toBeDefined();
    expect(screen.getByText('确认')).toBeDefined();
    expect(screen.getByText('取消')).toBeDefined();
    expect(screen.getByText('更新于 2024')).toBeDefined();
  });
});
