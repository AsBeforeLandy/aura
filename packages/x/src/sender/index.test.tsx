import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Sender } from './index';

const getTextarea = (container: HTMLElement) =>
  container.querySelector('textarea') as HTMLTextAreaElement;

describe('Sender', () => {
  it('正常：非受控输入，Enter 提交并清空', () => {
    const onSubmit = vi.fn();
    const { container } = render(<Sender onSubmit={onSubmit} />);

    fireEvent.change(getTextarea(container), { target: { value: '你好' } });
    fireEvent.keyDown(getTextarea(container), { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledWith('你好');
    expect(getTextarea(container).value).toBe('');
  });

  it('正常：点击发送按钮同样提交', () => {
    const onSubmit = vi.fn();
    render(<Sender onSubmit={onSubmit} defaultValue="预填" />);

    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    expect(onSubmit).toHaveBeenCalledWith('预填');
  });

  it('边界：Shift + Enter 换行不提交', () => {
    const onSubmit = vi.fn();
    const { container } = render(<Sender onSubmit={onSubmit} defaultValue="x" />);

    fireEvent.keyDown(getTextarea(container), {
      key: 'Enter',
      shiftKey: true,
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('边界：空白内容不提交', () => {
    const onSubmit = vi.fn();
    const { container } = render(<Sender onSubmit={onSubmit} />);

    fireEvent.change(getTextarea(container), { target: { value: '   ' } });
    fireEvent.keyDown(getTextarea(container), { key: 'Enter' });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正常：loading 时按钮变为「停止」，点击触发 onCancel，Enter 不提交', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(
      <Sender loading defaultValue="生成中" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByRole('button', { name: '停止生成' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(getTextarea(container), { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正常：受控模式——onChange 上报，提交后不清空', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const { container, rerender } = render(
      <Sender value="初始" onChange={onChange} onSubmit={onSubmit} />,
    );

    fireEvent.change(getTextarea(container), { target: { value: '初始2' } });
    expect(onChange).toHaveBeenCalledWith('初始2');

    // 父组件未更新 value，textarea 仍显示受控值
    fireEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(onSubmit).toHaveBeenCalledWith('初始');
    expect(getTextarea(container).value).toBe('初始');
    rerender(<Sender value="初始" onSubmit={onSubmit} />);
  });

  it('a11y：常规用法无 axe 违规（输入框有可访问名称）', async () => {
    const { container } = render(<Sender placeholder="输入消息" />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
