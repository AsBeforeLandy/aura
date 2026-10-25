import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Cursor,
  Draggable,
  FlipList,
  PageTransition,
  ReorderGroup,
  ReorderItem,
  Timeline,
  TimelineStep,
  ViewTransition,
} from '../index';

/**
 * composed 组件的意图断言（第一批：交互与编排类）。
 * 只断言渲染结果、状态机与降级行为，不断言动画中间帧。
 */

describe('Draggable', () => {
  it('渲染 children 并生成拖拽容器', () => {
    const { container } = render(
      <Draggable>
        <div>拖拽块</div>
      </Draggable>,
    );
    expect(screen.getByText('拖拽块')).toBeTruthy();
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('axis 与 bounds 属性可配置而不报错', () => {
    render(
      <Draggable axis="x" bounds={false} inertia={false}>
        <span>水平拖拽</span>
      </Draggable>,
    );
    expect(screen.getByText('水平拖拽')).toBeTruthy();
  });
});

describe('ReorderGroup / ReorderItem', () => {
  it('按 values 渲染全部条目', () => {
    render(
      <ReorderGroup axis="y" values={['甲', '乙', '丙']} onReorder={() => {}}>
        {['甲', '乙', '丙'].map((item) => (
          <ReorderItem key={item} value={item}>
            {item}
          </ReorderItem>
        ))}
      </ReorderGroup>,
    );
    expect(screen.getByText('甲')).toBeTruthy();
    expect(screen.getByText('乙')).toBeTruthy();
    expect(screen.getByText('丙')).toBeTruthy();
  });
});

describe('Cursor', () => {
  it('非精细指针环境（matchMedia 为 false）不渲染任何 DOM', () => {
    const { container } = render(<Cursor />);
    expect(container.firstChild).toBeNull();
  });

  it('variant 参数不改变降级行为', () => {
    const { container } = render(<Cursor variant="blob" hoverTargets="[data-x]" />);
    expect(container.firstChild).toBeNull();
  });
});

describe('FlipList', () => {
  it('渲染 items 为列表项', () => {
    const { container } = render(
      <FlipList
        items={[
          { id: 'a', node: '条目 A' },
          { id: 'b', node: '条目 B' },
        ]}
      />,
    );
    expect(container.querySelectorAll('li').length).toBe(2);
    expect(screen.getByText('条目 A')).toBeTruthy();
  });

  it('顺序变化后仍渲染全部条目（FLIP 重排不丢节点）', () => {
    const items = [
      { id: 'a', node: '条目 A' },
      { id: 'b', node: '条目 B' },
    ];
    const { container, rerender } = render(<FlipList items={items} />);
    rerender(<FlipList items={[...items].reverse()} />);
    expect(container.querySelectorAll('li').length).toBe(2);
    expect(screen.getByText('条目 A')).toBeTruthy();
    expect(screen.getByText('条目 B')).toBeTruthy();
  });

  it('as="ol" 渲染有序列表', () => {
    const { container } = render(<FlipList as="ol" items={[{ id: 'a', node: 'A' }]} />);
    expect(container.querySelector('ol')).toBeTruthy();
  });
});

describe('Timeline', () => {
  it('渲染全部步骤内容', () => {
    render(
      <Timeline>
        <TimelineStep at={0}>
          <div>步骤一</div>
        </TimelineStep>
        <TimelineStep at={0.2}>
          <div>步骤二</div>
        </TimelineStep>
      </Timeline>,
    );
    expect(screen.getByText('步骤一')).toBeTruthy();
    expect(screen.getByText('步骤二')).toBeTruthy();
  });
});

describe('PageTransition', () => {
  it('渲染当前页面内容', () => {
    render(
      <PageTransition transitionKey="/a">
        <div>页面 A</div>
      </PageTransition>,
    );
    expect(screen.getByText('页面 A')).toBeTruthy();
  });

  it('transitionKey 变化后展示新页面（sync 模式交叉过渡）', () => {
    const { rerender } = render(
      <PageTransition transitionKey="/a" mode="sync">
        <div>页面 A</div>
      </PageTransition>,
    );
    rerender(
      <PageTransition transitionKey="/b" mode="sync">
        <div>页面 B</div>
      </PageTransition>,
    );
    expect(screen.getByText('页面 B')).toBeTruthy();
  });
});

describe('ViewTransition', () => {
  it('无 View Transitions API 时降级为普通渲染', () => {
    // jsdom 没有 document.startViewTransition，走渐进增强降级路径
    render(
      <ViewTransition name="card">
        <div>视图内容</div>
      </ViewTransition>,
    );
    expect(screen.getByText('视图内容')).toBeTruthy();
  });
});
