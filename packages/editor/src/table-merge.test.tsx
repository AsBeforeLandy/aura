import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  Editor,
  canMergeSelectedCells,
  canSplitTableCell,
  mergeSelectedCells,
  splitTableCell,
} from './index';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { CellSelection } from '@tiptap/pm/tables';

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

/** 框选一段单元格（按文本定位两个角） */
function selectCells(editor: TiptapEditor, fromText: string, toText: string) {
  const findPos = (text: string): number => {
    let found = -1;
    editor.state.doc.descendants((node, pos) => {
      if (found < 0 && node.isText && node.text === text) found = pos;
    });
    if (found < 0) throw new Error(`找不到文本 ${text}`);
    return found;
  };
  // 文本在 cell > paragraph 里，回退 2 层才是 cell 节点起点
  const anchor = findPos(fromText) - 2;
  const head = findPos(toText) - 2;
  editor.view.dispatch(
    editor.state.tr.setSelection(
      CellSelection.create(editor.state.doc, anchor, head),
    ),
  );
}

describe('表格合并 / 拆分（选区模式）', () => {
  it('框选第一行后合并，整行变成 colspan=3 且内容保留', async () => {
    const { editor } = await renderEditor();
    selectCells(editor, 'A1', 'C1');

    expect(canMergeSelectedCells(editor)).toBe(true);
    expect(mergeSelectedCells(editor)).toBe(true);

    const html = editor.getHTML();
    expect(html).toContain('colspan="3"');
    // prosemirror-tables 的 mergeCells 保留全部内容，不丢数据
    expect(html).toContain('A1');
    expect(html).toContain('B1');
    expect(html).toContain('C1');
    // 第二行不受影响
    expect(html).toContain('A2');
  });

  it('框选第一列后合并，得到 rowspan=2', async () => {
    const { editor } = await renderEditor();
    selectCells(editor, 'A1', 'A2');

    expect(mergeSelectedCells(editor)).toBe(true);

    const html = editor.getHTML();
    expect(html).toContain('rowspan="2"');
    expect(html).toContain('A1');
    expect(html).toContain('A2');
  });

  it('合并后可以拆分还原', async () => {
    const { editor } = await renderEditor();
    selectCells(editor, 'A1', 'C1');
    mergeSelectedCells(editor);

    // 合并后光标停在合并结果里，此时应可拆分
    expect(canSplitTableCell(editor)).toBe(true);
    expect(splitTableCell(editor)).toBe(true);
    expect(editor.getHTML()).not.toContain('colspan');
  });

  it('普通文本光标不可合并（按钮应禁用）', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    // 光标在单元格里但没有框选时，不能合并
    expect(canMergeSelectedCells(editor)).toBe(false);
    expect(mergeSelectedCells(editor)).toBe(false);
  });

  it('光标不在表格里时所有命令都返回 false', async () => {
    const { editor } = await renderEditor();
    editor.commands.setContent('<p>不在表格里</p>');
    editor.commands.setTextSelection(1);

    expect(canMergeSelectedCells(editor)).toBe(false);
    expect(mergeSelectedCells(editor)).toBe(false);
    expect(splitTableCell(editor)).toBe(false);
    expect(canSplitTableCell(editor)).toBe(false);
  });

  // 边界：框选单个格子没有合并的意义
  it('框选单个格子时不可合并', async () => {
    const { editor } = await renderEditor();
    selectCells(editor, 'B1', 'B1');

    expect(canMergeSelectedCells(editor)).toBe(false);
    expect(mergeSelectedCells(editor)).toBe(false);
  });
});
