import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ThoughtChain } from './index';
import type { ThoughtChainItem } from './index';

const doneItems: ThoughtChainItem[] = [
  { key: 'a', title: '检索知识库', description: '命中 3 篇', status: 'success' },
  { key: 'b', title: '生成结论', description: '输出补丁', status: 'success' },
];

const mixedItems: ThoughtChainItem[] = [
  { key: 'a', title: '拆解任务', status: 'success' },
  { key: 'b', title: '拉取仓库', status: 'error', description: '网络超时' },
  { key: 'c', title: '汇总报告', status: 'pending' },
];

const runningItems: ThoughtChainItem[] = [
  { key: 'a', title: '检索', status: 'success' },
  { key: 'b', title: '分析差距', status: 'thinking' },
];

const summaryOf = (container: HTMLElement) =>
  container.querySelector('.aura-x-thought-chain-summary')?.textContent;

describe('ThoughtChain', () => {
  it('正常：默认折叠为一行摘要，不渲染步骤列表', () => {
    const { container } = render(<ThoughtChain items={doneItems} />);

    expect(summaryOf(container)).toBe('已完成');
    expect(container.querySelector('.aura-x-thought-chain-header')).not.toBeNull();
    expect(container.querySelector('.aura-x-thought-chain-list')).toBeNull();
  });

  it('正常：点击头部展开后渲染步骤标题、描述与状态类名', () => {
    const onExpandChange = vi.fn();
    const { container } = render(
      <ThoughtChain items={doneItems} onExpandChange={onExpandChange} />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onExpandChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('检索知识库')).toBeDefined();
    expect(screen.getByText('命中 3 篇')).toBeDefined();
    expect(
      container.querySelectorAll('.aura-x-thought-chain-item--success'),
    ).toHaveLength(2);
    // success 节点渲染内置对勾
    expect(
      container.querySelector('.aura-x-thought-chain-node--success')?.textContent,
    ).toBe('✓');
  });

  it('正常：再次点击头部收起，回调收到 false', () => {
    const onExpandChange = vi.fn();
    const { container } = render(
      <ThoughtChain
        items={doneItems}
        defaultExpanded
        onExpandChange={onExpandChange}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onExpandChange).toHaveBeenCalledWith(false);
    expect(container.querySelector('.aura-x-thought-chain-list')).toBeNull();
  });

  it('边界：空列表摘要为「暂无步骤」，展开后列表为空', () => {
    const { container } = render(<ThoughtChain items={[]} defaultExpanded />);

    expect(summaryOf(container)).toBe('暂无步骤');
    expect(container.querySelectorAll('.aura-x-thought-chain-item')).toHaveLength(0);
  });

  it('边界：collapsible=false 平铺展示，无头部按钮', () => {
    const { container } = render(<ThoughtChain items={doneItems} collapsible={false} />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('.aura-x-thought-chain--plain')).not.toBeNull();
    expect(container.querySelectorAll('.aura-x-thought-chain-item')).toHaveLength(2);
  });

  it('边界：受控 expanded 不随点击变化，但 onExpandChange 仍回调', () => {
    const onExpandChange = vi.fn();
    const { container } = render(
      <ThoughtChain items={doneItems} expanded={false} onExpandChange={onExpandChange} />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onExpandChange).toHaveBeenCalledWith(true);
    // 受控态下渲染结果不变：仍为折叠
    expect(container.querySelector('.aura-x-thought-chain-list')).toBeNull();
  });

  it('边界：未完成链路摘要为「共 N 步」，含失败步骤改为「含有失败步骤」', () => {
    const pendingItems: ThoughtChainItem[] = [
      { key: 'a', title: '一', status: 'pending' },
      { key: 'b', title: '二', status: 'pending' },
    ];

    const { container: pending } = render(<ThoughtChain items={pendingItems} />);
    expect(summaryOf(pending)).toBe('共 2 步');

    const { container: mixed } = render(<ThoughtChain items={mixedItems} />);
    expect(summaryOf(mixed)).toBe('含有失败步骤');
  });

  it('边界：自定义 icon 覆盖内置状态节点内容', () => {
    const { container } = render(
      <ThoughtChain
        defaultExpanded
        items={[{ key: 'a', title: '自定义', icon: <em data-testid="custom">★</em> }]}
      />,
    );

    expect(screen.getByTestId('custom')).toBeDefined();
    expect(container.querySelector('.aura-x-thought-chain-node--pending')).not.toBeNull();
  });

  it('异常：存在 thinking 步骤时强制展开且头部不可点击', () => {
    const onExpandChange = vi.fn();
    const { container } = render(
      <ThoughtChain items={runningItems} onExpandChange={onExpandChange} />,
    );

    const header = screen.getByRole('button');

    // 强制展开：即便 defaultExpanded 为 false，列表也已渲染
    expect(container.querySelector('.aura-x-thought-chain--running')).not.toBeNull();
    expect(container.querySelector('.aura-x-thought-chain-list')).not.toBeNull();
    expect(summaryOf(container)).toBe('进行中');
    // 头部禁用 + aria-expanded 反映真实展开态
    expect((header as HTMLButtonElement).disabled).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('true');

    // 点击不产生状态变化（禁用 + toggle 内的 forceOpen 早返回双重保护）
    fireEvent.click(header);
    expect(onExpandChange).not.toHaveBeenCalled();
    expect(container.querySelector('.aura-x-thought-chain-list')).not.toBeNull();
  });

  it('a11y：展开态无 axe 违规', async () => {
    const { container } = render(<ThoughtChain items={mixedItems} defaultExpanded />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
