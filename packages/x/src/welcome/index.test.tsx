import { render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Welcome } from './index';

describe('Welcome', () => {
  it('正常：渲染标题 / 描述 / extra，board 变体带边框', () => {
    const { container } = render(
      <Welcome
        title="早上好"
        description="今天想聊点什么？"
        extra={<div data-testid="extra">提示词</div>}
      />,
    );

    expect(screen.getByText('早上好')).toBeDefined();
    expect(screen.getByText('今天想聊点什么？')).toBeDefined();
    expect(screen.getByTestId('extra')).toBeDefined();
    expect(container.querySelector('.aura-x-welcome--board')).not.toBeNull();
  });

  it('a11y：无 axe 违规', async () => {
    const { container } = render(<Welcome title="你好" description="描述" />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
