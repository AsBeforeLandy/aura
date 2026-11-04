/**
 * @aura-react-comp/editor
 *
 * 基于 Tiptap / ProseMirror 的富文本编辑器。
 * 引擎负责文档模型，Aura 负责外观 —— 主题完全由令牌驱动。
 */

export { Editor } from './editor';
export { Toolbar } from './toolbar';
export type { ToolbarProps } from './toolbar';
export { buildExtensions } from './extensions';
export type { BuildExtensionsOptions } from './extensions';
export { resolveFeatures } from './types';
export type {
  EditorProps,
  EditorFeatures,
  EditorImageOptions,
  EditorChangeContext,
  EditorToolbarMode,
  ResolvedFeatures,
} from './types';
