import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Suggestion } from './index';

const items = [
  { key: 's1', label: '继续展开说明' },
  { key: 's2', label: '换个例子' },
];

describe('Suggestion', () => {
  it('正常：open=true 渲染建议并回调 onSelect', () => {
    const onSelect = vi.fn();
    render(<Suggestion items={items} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('换个例子'));
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it('边界：open=false 或空列表时渲染 null', () => {
    const { container: closed } = render(
      <Suggestion items={items} open={false} />,
    );
    const { container: empty } = render(<Suggestion items={[]} />);

    expect(closed.querySelector('ul')).toBeNull();
    expect(empty.querySelector('ul')).toBeNull();
  });
});
