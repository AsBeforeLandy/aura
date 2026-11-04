import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import { Editor } from './index';

/** Tiptap 实例的最小结构，避免测试里到处写 any */
interface EditorLike {
  commands: {
    insertContent: (content: string) => void;
    setContent: (content: string) => void;
    selectAll: () => void;
  };
  getHTML: () => string;
}

async function renderEditor(props: React.ComponentProps<typeof Editor>) {
  let instance: EditorLike | null = null;
  const result = render(
    <Editor
      {...props}
      onReady={(editor) => {
        instance = editor as unknown as EditorLike;
      }}
    />,
  );
  await waitFor(() => expect(instance).not.toBeNull());
  return { ...result, editor: instance as EditorLike | null };
}

describe('Editor', () => {
  it('渲染编辑区与默认工具栏', async () => {
    await renderEditor({ defaultValue: '<p>你好 Aura</p>' });

    expect(await screen.findByText('你好 Aura')).toBeTruthy();
    expect(screen.getByRole('toolbar')).toBeTruthy();
    expect(screen.getByLabelText('加粗')).toBeTruthy();
    expect(screen.getByLabelText('撤销')).toBeTruthy();
  });

  it('内容变更时回调 html 与统计上下文', async () => {
    const onChange = vi.fn();
    const { editor } = await renderEditor({
      defaultValue: '<p>初始</p>',
      onChange,
    });

    act(() => {
      editor?.commands.insertContent('追加内容');
    });

    // 初始化阶段编辑器自身也会派发一次事务，因此断言最后一次回调
    await waitFor(() => {
      expect(onChange.mock.calls.at(-1)?.[0]).toContain('追加内容');
    });
    const [html, context] = onChange.mock.calls.at(-1)!;
    expect(html).toContain('追加内容');
    expect(context.html).toBe(html);
    expect(context.characters).toBeGreaterThan(0);
    expect(context.json).toBeTruthy();
    expect(typeof context.text).toBe('string');
  });

  // 边界：关闭某项能力时，工具栏按钮必须同步消失（而不是只隐藏扩展）
  it('features 关闭时对应按钮不渲染', async () => {
    await renderEditor({
      defaultValue: '<p>x</p>',
      features: { bold: false, table: false },
    });

    expect(screen.queryByLabelText('加粗')).toBeNull();
    expect(screen.queryByLabelText('表格')).toBeNull();
    // 未关闭的仍然存在
    expect(screen.getByLabelText('斜体')).toBeTruthy();
  });

  // 边界：只读模式不显示工具栏，也不允许编辑
  it('readOnly 时隐藏工具栏', async () => {
    await renderEditor({ defaultValue: '<p>只读</p>', readOnly: true });
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(screen.getByText('只读')).toBeTruthy();
  });

  // 边界：受控值变化应同步进编辑器
  it('受控 value 更新后同步内容', async () => {
    const { rerender, editor } = await renderEditor({ value: '<p>第一版</p>' });

    rerender(<Editor value="<p>第二版</p>" />);

    await waitFor(() => {
      expect(editor?.getHTML()).toContain('第二版');
    });
  });

  // 异常：非法 HTML 不应让编辑器崩溃
  it('非法 HTML 不导致崩溃', async () => {
    await renderEditor({ defaultValue: '<p>未闭合<div><span' });
    expect(screen.getByRole('toolbar')).toBeTruthy();
  });

  it('英文语言包替换工具栏文案', async () => {
    await renderEditor({ defaultValue: '<p>x</p>', locale: 'en-US' });
    expect(screen.getByLabelText('Bold')).toBeTruthy();
  });
});

describe('Toolbar 交互', () => {
  it('选中文本后点击加粗，输出含 strong 标签', async () => {
    const { editor } = await renderEditor({ defaultValue: '<p>加粗我</p>' });

    act(() => editor?.commands.selectAll());
    fireEvent.click(screen.getByLabelText('加粗'));

    await waitFor(() => expect(editor?.getHTML()).toContain('<strong>'));
  });

  it('点击分割线按钮插入 hr', async () => {
    const { editor } = await renderEditor({ defaultValue: '<p>x</p>' });
    fireEvent.click(screen.getByLabelText('分割线'));
    await waitFor(() => expect(editor?.getHTML()).toContain('<hr'));
  });

  it('点击表格按钮插入表格', async () => {
    const { editor } = await renderEditor({ defaultValue: '<p>x</p>' });
    fireEvent.click(screen.getByLabelText('表格'));
    await waitFor(() => expect(editor?.getHTML()).toContain('<table'));
  });

  it('点击有序列表按钮插入 ol', async () => {
    const { editor } = await renderEditor({ defaultValue: '<p>第一项</p>' });
    fireEvent.click(screen.getByLabelText('有序列表'));
    await waitFor(() => expect(editor?.getHTML()).toContain('<ol'));
  });

  it('链接气泡可写入 href', async () => {
    const { editor } = await renderEditor({ defaultValue: '<p>链接文字</p>' });

    act(() => editor?.commands.selectAll());
    fireEvent.click(screen.getByLabelText('链接'));

    const input =
      await screen.findByPlaceholderText('输入链接地址，留空则移除链接');
    fireEvent.change(input, { target: { value: 'https://aura.dev' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() =>
      expect(editor?.getHTML()).toContain('https://aura.dev'),
    );
  });

  // 异常：空输入提交不应破坏文档
  it('链接输入为空时安全处理', async () => {
    const { editor } = await renderEditor({ defaultValue: '<p>abc</p>' });
    fireEvent.click(screen.getByLabelText('链接'));
    const input =
      await screen.findByPlaceholderText('输入链接地址，留空则移除链接');
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(editor?.getHTML()).toContain('abc'));
  });

  it('清除格式移除行内标记', async () => {
    const { editor } = await renderEditor({
      defaultValue: '<p><strong>粗</strong>体</p>',
    });
    act(() => editor?.commands.selectAll());
    fireEvent.click(screen.getByLabelText('清除格式'));
    await waitFor(() => expect(editor?.getHTML()).not.toContain('<strong>'));
  });

  it('图像气泡在无上传函数时只提供 URL 输入', async () => {
    await renderEditor({ defaultValue: '<p>x</p>' });
    fireEvent.click(screen.getByLabelText('图片'));
    expect(await screen.findByPlaceholderText('输入图片地址')).toBeTruthy();
    expect(screen.queryByText('上传图片')).toBeNull();
  });
});
