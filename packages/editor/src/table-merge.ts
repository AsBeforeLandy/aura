import {
  CellSelection,
  TableMap,
  cellAround,
  findTable,
  mergeCells,
  selectedRect,
  splitCell,
} from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/react';

/**
 * 表格合并 / 拆分命令。
 *
 * 交互模型：用户在表格里**拖动框选**（或 shift+点击）形成单元格选区，
 * 再点「合并」把选区合并成一个格子。
 *
 * 框选交互不用自己写——prosemirror-tables 的 tableEditing 插件自带
 * `handleDOMEvents.mousedown` 拖选与 `drawCellSelection` 高亮，
 * Tiptap 的 TableKit 已经注册了它。这里补的是命令的门控与入口。
 */

/**
 * 当前选区是否可合并。
 *
 * 两个条件：
 *   1. 选区必须是单元格选区（CellSelection）——普通文本光标不算；
 *   2. 选区覆盖的**独立格子数大于 1**——跨过一个已合并的格子时
 *      矩形看着是 2×2，实际只有 1 个格子，没有合并的意义。
 */
export function canMergeSelectedCells(editor: Editor): boolean {
  const { state } = editor;
  if (!(state.selection instanceof CellSelection)) return false;

  const rect = selectedRect(state);
  const cells = new Set<number>();
  for (let row = rect.top; row < rect.bottom; row += 1) {
    for (let col = rect.left; col < rect.right; col += 1) {
      cells.add(rect.map.map[row * rect.map.width + col]);
    }
  }
  return cells.size > 1;
}

/**
 * 合并当前选中的单元格。
 *
 * 内容不丢弃：prosemirror-tables 会把选区内所有格子的内容
 * 拼进左上角的格子，用空段落分隔。
 */
export function mergeSelectedCells(editor: Editor): boolean {
  if (!canMergeSelectedCells(editor)) return false;
  return editor
    .chain()
    .command(({ state, dispatch }) => mergeCells(state, dispatch))
    .run();
}

/** 当前单元格是否是合并产物（colspan 或 rowspan 大于 1 才有得拆） */
export function canSplitTableCell(editor: Editor): boolean {
  const { state } = editor;
  const { $from } = state.selection;
  const table = findTable($from);
  if (!table) return false;

  const $cell = cellAround($from);
  if (!$cell) return false;
  const cellNode = state.doc.nodeAt($cell.pos);
  if (!cellNode) return false;

  return (cellNode.attrs.colspan ?? 1) > 1 || (cellNode.attrs.rowspan ?? 1) > 1;
}

/** 拆分当前合并过的单元格，恢复成独立格子 */
export function splitTableCell(editor: Editor): boolean {
  if (!canSplitTableCell(editor)) return false;
  return editor
    .chain()
    .focus()
    .command(({ state, dispatch }) => splitCell(state, dispatch))
    .run();
}

/** 供测试构造单元格选区使用 */
export { TableMap };
