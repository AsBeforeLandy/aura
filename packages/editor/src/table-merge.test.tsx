import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  Editor,
  mergeTableRow,
  mergeTableColumn,
  splitTableCell,
  canSplitTableCell,
} from './index';
import type { Editor as TiptapEditor } from '@tiptap/react';

const TABLE_HTML = `
<table>
  <tbody>
    <tr><td>A1</td><td>B1</td><td>C1</td></tr>
    <tr><td>A2</td><td>B2</td><td>C2</td></tr>
  </tbody>
</table>
`;

async function renderEditor() {
  // 用对象包装，避免 TS 把闭包内的赋值窄化成 null
  const holder: { editor: TiptapEditor | null } = { editor: null };
  render(
    <Editor
      defaultValue={TABLE_HTML}
      onReady={(editor) => {
        holder.editor = editor as TiptapEditor;
      }}
    />,
  );
  await waitFor(() => expect(holder.editor).not.toBeNull());
  const editor = holder.editor as TiptapEditor;
  return { editor };
}

/** 把光标放进包含指定文本的单元格里 */
function focusCellWithText(editor: TiptapEditor, text: string) {
  let target = -1;
  editor.state.doc.descendants((node, pos) => {
    if (target < 0 && node.isText && node.text === text) {
      target = pos;
    }
  });
  if (target < 0) throw new Error(`找不到文本 ${text}`);
  editor.commands.setTextSelection(target + 1);
}

describe('表格合并 / 拆分', () => {
  it('合并行后整行变成一个 colspan=3 的格子，内容保留', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    expect(mergeTableRow(editor)).toBe(true);

    const html = editor.getHTML();
    expect(html).toContain('colspan="3"');
    // prosemirror-tables 的 mergeCells 保留全部内容，不丢数据
    expect(html).toContain('A1');
    expect(html).toContain('B1');
    expect(html).toContain('C1');
    // 第二行不受影响
    expect(html).toContain('A2');
  });

  it('合并列后第一列变成一个 rowspan=2 的格子', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    expect(mergeTableColumn(editor)).toBe(true);

    const html = editor.getHTML();
    expect(html).toContain('rowspan="2"');
    expect(html).toContain('A1');
    expect(html).toContain('A2');
  });

  it('合并后可以拆分还原', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    mergeTableRow(editor);
    // 合并后光标停在合并结果里，此时应可拆分
    expect(canSplitTableCell(editor)).toBe(true);

    expect(splitTableCell(editor)).toBe(true);
    expect(editor.getHTML()).not.toContain('colspan');
  });

  it('单格行无法再合并行（按钮应禁用）', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    mergeTableRow(editor); // 整行合并成 1 格
    // 合并后这一行只剩一个格子，再执行应当返回 false
    expect(mergeTableRow(editor)).toBe(false);
  });

  it('光标不在表格里时所有命令都返回 false', async () => {
    const { editor } = await renderEditor();
    editor.commands.setContent('<p>不在表格里</p>');
    editor.commands.setTextSelection(1);

    expect(mergeTableRow(editor)).toBe(false);
    expect(mergeTableColumn(editor)).toBe(false);
    expect(splitTableCell(editor)).toBe(false);
    expect(canSplitTableCell(editor)).toBe(false);
  });
});
