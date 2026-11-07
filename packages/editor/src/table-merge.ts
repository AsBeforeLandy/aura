import {
  CellSelection,
  TableMap,
  cellAround,
  findTable,
  mergeCells,
  splitCell,
} from '@tiptap/pm/tables';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';

/**
 * 表格合并 / 拆分命令。
 *
 * Tiptap 开源的 TableKit 已经内置了 prosemirror-tables 的合并命令，
 * 这里补的是「选区」这一层：合并命令要求当前选区是 CellSelection，
 * 而默认的文本选区不是 —— 所以「合并行 / 合并列」的实际工作是
 * 先把选区切换成整行 / 整列的单元格选区，再交给 mergeCells。
 */

/** prosemirror-tables 的 Rect 只有四个边界，没有宽高 */
interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface CellInfo {
  /** 表格内容起点在文档中的绝对位置 */
  tableStart: number;
  map: TableMap;
  tableNode: PMNode;
  rect: Rect;
  /** 当前单元格节点 */
  cellNode: PMNode;
}

/** 定位光标所在的单元格，拿不到（不在表格里）返回 null */
function getCellInfo(editor: Editor): CellInfo | null {
  const { state } = editor;
  const { $from } = state.selection;
  const table = findTable($from);
  if (!table) return null;

  const $cell = cellAround($from);
  if (!$cell) return null;
  const cellNode = state.doc.nodeAt($cell.pos);
  if (!cellNode) return null;

  const map = TableMap.get(table.node);
  const tableStart = table.pos + 1;
  const rect = map.findCell($cell.pos - tableStart);

  return { tableStart, map, tableNode: table.node, rect, cellNode };
}

/**
 * 统计某一行 / 列上互不相同的格子数。
 *
 * 注意 findCell 返回的 rect 是「当前单元格自己占的范围」，
 * 不是整行 —— 已合并的格子 colspan 会让它变宽，但也不能拿它当行宽用。
 */
function countCellsInRow(info: CellInfo, row: number): number {
  const cells = new Set<number>();
  for (let col = 0; col < info.map.width; col += 1) {
    cells.add(info.map.map[row * info.map.width + col]);
  }
  return cells.size;
}

function countCellsInColumn(info: CellInfo, col: number): number {
  const cells = new Set<number>();
  for (let row = 0; row < info.map.height; row += 1) {
    cells.add(info.map.map[row * info.map.width + col]);
  }
  return cells.size;
}

/** 当前行里有多个格子时才可合并（已合并成整行的行再合并没有意义） */
export function canMergeTableRow(editor: Editor): boolean {
  const info = getCellInfo(editor);
  if (!info) return false;
  return countCellsInRow(info, info.rect.top) > 1;
}

/** 当前列跨多行时才可合并 */
export function canMergeTableColumn(editor: Editor): boolean {
  const info = getCellInfo(editor);
  if (!info) return false;
  return countCellsInColumn(info, info.rect.left) > 1;
}

/** 当前单元格是否是合并产物（colspan 或 rowspan 大于 1 才有得拆） */
export function canSplitTableCell(editor: Editor): boolean {
  const info = getCellInfo(editor);
  if (!info) return false;
  return (
    (info.cellNode.attrs.colspan ?? 1) > 1 ||
    (info.cellNode.attrs.rowspan ?? 1) > 1
  );
}

function selectAndMerge(
  editor: Editor,
  anchorAbs: number,
  headAbs: number,
  kind: 'row' | 'column',
): boolean {
  const { state } = editor;
  const $anchor = state.doc.resolve(anchorAbs);
  const $head = state.doc.resolve(headAbs);
  const selection =
    kind === 'row'
      ? CellSelection.rowSelection($anchor, $head)
      : CellSelection.colSelection($anchor, $head);

  // 先把选区切到单元格选区，单独派发。
  // 不能和合并塞进同一条链：tiptap 链式命令共享一个 transaction，
  // 而 mergeCells 内部还要用 state.tr 另开事务 —— transaction 上没有 .tr，
  // 直接传 tr 会抛「Cannot read properties of undefined (reading 'mapping')」。
  // 选区变化不改动文档，不会触发 onChange，也不会进撤销栈。
  editor.view.dispatch(state.tr.setSelection(selection));

  // 此时 editor.state.selection 已是 CellSelection，合并命令可以直接执行
  return editor
    .chain()
    .command(({ state: nextState, dispatch }) =>
      mergeCells(nextState, dispatch),
    )
    .run();
}

/**
 * 合并光标所在的整行。
 *
 * 内容不丢弃：prosemirror-tables 的 mergeCells 会把选区内所有单元格
 * 的内容拼进左上角的格子，用空段落分隔。
 */
export function mergeTableRow(editor: Editor): boolean {
  const info = getCellInfo(editor);
  if (!info || countCellsInRow(info, info.rect.top) <= 1) return false;

  // 选区覆盖整行：从第一列到最后一个格子
  const anchorAbs =
    info.tableStart + info.map.positionAt(info.rect.top, 0, info.tableNode);
  const headAbs =
    info.tableStart +
    info.map.positionAt(info.rect.top, info.map.width - 1, info.tableNode);

  return selectAndMerge(editor, anchorAbs, headAbs, 'row');
}

/** 合并光标所在的整列 */
export function mergeTableColumn(editor: Editor): boolean {
  const info = getCellInfo(editor);
  if (!info || countCellsInColumn(info, info.rect.left) <= 1) return false;

  // 选区覆盖整列：从第一行到最后一个格子
  const anchorAbs =
    info.tableStart + info.map.positionAt(0, info.rect.left, info.tableNode);
  const headAbs =
    info.tableStart +
    info.map.positionAt(info.map.height - 1, info.rect.left, info.tableNode);

  return selectAndMerge(editor, anchorAbs, headAbs, 'column');
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
