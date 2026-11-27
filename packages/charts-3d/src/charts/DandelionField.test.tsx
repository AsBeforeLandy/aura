import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DandelionField } from './DandelionField';

describe('DandelionField', () => {
  it('默认渲染容器、支持 className/style/ref 透传且未测量前不创建 canvas', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <DandelionField
        ref={ref}
        height={380}
        className="hero-bg"
        style={{ borderRadius: 16 }}
      >
        <h1>Hero Title</h1>
      </DandelionField>,
    );

    const root = ref.current;
    expect(root).not.toBeNull();
    expect(root?.classList.contains('aura-dandelion-field')).toBe(true);
    expect(root?.classList.contains('hero-bg')).toBe(true);
    expect(root?.style.height).toBe('380px');
    expect(root?.style.borderRadius).toBe('16px');
    expect(container.querySelector('canvas')).toBeNull();
    expect(screen.getByText('Hero Title')).toBeDefined();
  });

  it('支持函数式 ref 与交互事件触发不报错', () => {
    let captured: HTMLDivElement | null = null;
    render(
      <DandelionField
        ref={(node) => {
          captured = node;
        }}
        interactive
        gustSignal={1}
        regatherSignal={1}
      />,
    );

    expect(captured).not.toBeNull();
    fireEvent.pointerMove(captured!, { clientX: 60, clientY: 80 });
    fireEvent.pointerMove(captured!, { clientX: 120, clientY: 50 });
    fireEvent.click(captured!);
    fireEvent.pointerLeave(captured!);
  });

  it('interactive=false 时忽略指针事件且设置 displayName', () => {
    const { container } = render(<DandelionField interactive={false} />);
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 20, clientY: 20 });
    fireEvent.click(root);
    expect(DandelionField.displayName).toBe('DandelionField');
  });
});
