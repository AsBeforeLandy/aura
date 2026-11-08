import { cellAround, setCellAttr } from '@tiptap/pm/tables';
import { TableCell, TableHeader } from '@tiptap/extension-table';
import type { Editor } from '@tiptap/react';

/**
 * 表格单元格垂直对齐。
 *
 * 交给 prosemirror-tables 的 setCellAttr 执行：框选多个格子时批量生效，
 * 单光标时作用于当前格子；值相同时返回 false（按钮的 disabled / active 可直接用）。
 */

export type CellVerticalAlign = 'top' | 'middle' | 'bottom';

/** 给 TableCell / TableHeader 挂 verticalAlign 属性，随 HTML style 往返 */
const verticalAlignAttribute = {
  verticalAlign: {
    default: null,
    parseHTML: (element: HTMLElement) =>
      (element.style.verticalAlign || null) as CellVerticalAlign | null,
    renderHTML: (attributes: { verticalAlign?: string | null }) =>
      attributes.verticalAlign
        ? { style: `vertical-align: ${attributes.verticalAlign}` }
        : {},
  },
};

/** 替换 TableKit 内置的 cell / header —— name 不变，schema 兼容 */
export const auraTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...verticalAlignAttribute,
    };
  },
});

export const auraTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...verticalAlignAttribute,
    };
  },
});

/** 读取光标所在单元格当前的垂直对齐（按钮 active 态用） */
export function getCellVerticalAlign(editor: Editor): CellVerticalAlign | null {
  const { state } = editor;
  const $cell = cellAround(state.selection.$from);
  if (!$cell) return null;
  const node = state.doc.nodeAt($cell.pos);
  if (!node) return null;
  const value = node.attrs.verticalAlign;
  return value === 'top' || value === 'middle' || value === 'bottom'
    ? value
    : null;
}

/** 设置选中单元格的垂直对齐；传 null 恢复默认（清除属性） */
export function setCellVerticalAlign(
  editor: Editor,
  value: CellVerticalAlign | null,
): boolean {
  if (!editor.isActive('table')) return false;
  return editor
    .chain()
    .command(({ state, dispatch }) =>
      setCellAttr('verticalAlign', value)(state, dispatch),
    )
    .run();
}
