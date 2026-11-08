import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Editor, getCellVerticalAlign, setCellVerticalAlign } from './index';
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

async function renderEditor(defaultValue: string = TABLE_HTML) {
  const holder: { editor: TiptapEditor | null } = { editor: null };
  render(
    <Editor
      defaultValue={defaultValue}
      onReady={(editor) => {
        holder.editor = editor as TiptapEditor;
      }}
    />,
  );
  await waitFor(() => expect(holder.editor).not.toBeNull());
  const editor = holder.editor as TiptapEditor;
  return { editor };
}

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

/** 框选两个角所在的矩形区域 */
function selectRect(editor: TiptapEditor, fromText: string, toText: string) {
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

describe('单元格垂直对齐', () => {
  it('解析已有 style，往返保持', async () => {
    const { editor } = await renderEditor(
      `<table><tbody><tr><td style="vertical-align: middle">甲</td><td>乙</td></tr></tbody></table>`,
    );
    focusCellWithText(editor, '甲');

    expect(getCellVerticalAlign(editor)).toBe('middle');
    // 往返：getHTML 保留对齐样式
    expect(editor.getHTML()).toContain('vertical-align: middle');
  });

  it('设置 middle 后写入 style，active 态正确', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    expect(getCellVerticalAlign(editor)).toBeNull();
    expect(setCellVerticalAlign(editor, 'middle')).toBe(true);

    const html = editor.getHTML();
    expect(html).toContain('vertical-align: middle');
    expect(getCellVerticalAlign(editor)).toBe('middle');
  });

  it('框选多个格子时批量设置', async () => {
    const { editor } = await renderEditor();
    selectRect(editor, 'A1', 'B1');

    expect(setCellVerticalAlign(editor, 'bottom')).toBe(true);

    const html = editor.getHTML();
    // A1、B1 都有了，C1 没有
    expect((html.match(/vertical-align: bottom/g) ?? []).length).toBe(2);
  });

  it('再次设置相同值时命令返回 false（幂等）', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    expect(setCellVerticalAlign(editor, 'top')).toBe(true);
    // 已是 top，重复设置无效
    expect(setCellVerticalAlign(editor, 'top')).toBe(false);
  });

  it('切换对齐方式覆盖旧值', async () => {
    const { editor } = await renderEditor();
    focusCellWithText(editor, 'A1');

    setCellVerticalAlign(editor, 'middle');
    expect(setCellVerticalAlign(editor, 'bottom')).toBe(true);
    expect(getCellVerticalAlign(editor)).toBe('bottom');
    expect(editor.getHTML()).toContain('vertical-align: bottom');
  });

  it('光标不在表格里时返回 false', async () => {
    const { editor } = await renderEditor();
    editor.commands.setContent('<p>普通段落</p>');
    editor.commands.setTextSelection(1);

    expect(setCellVerticalAlign(editor, 'middle')).toBe(false);
    expect(getCellVerticalAlign(editor)).toBeNull();
  });
});
