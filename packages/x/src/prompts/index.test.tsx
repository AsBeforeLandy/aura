import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Prompts } from './index';

const items = [
  { key: 'a', label: '写一首诗', description: '以秋天为主题' },
  { key: 'b', label: '解释量子纠缠', icon: <span data-testid="icon" /> },
];

describe('Prompts', () => {
  it('正常：渲染按钮列表并回调 onItemClick', async () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Prompts items={items} onItemClick={onItemClick} />,
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByText('写一首诗')).toBeDefined();
    expect(screen.getByText('以秋天为主题')).toBeDefined();
    expect(screen.getByTestId('icon')).toBeDefined();

    fireEvent.click(buttons[0]);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  it('a11y：按钮列表无 axe 违规', async () => {
    const { container } = render(<Prompts items={items} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
