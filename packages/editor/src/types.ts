import type { JSONContent } from '@tiptap/react';

/** 图片能力的配置 */
export interface EditorImageOptions {
  /** 是否启用 */
  enabled?: boolean;
  /**
   * 上传函数：返回可访问的图片地址。
   * 不提供时只能通过填写 URL 插入图片。
   */
  upload?: (file: File) => Promise<string>;
  /** 文件选择器的 accept 属性 */
  accept?: string;
}

/**
 * 功能开关。
 *
 * 所有能力默认开启 —— 需求是「最完整的编辑器功能」，
 * 让使用者按需关闭比按需开启更符合预期。
 */
export interface EditorFeatures {
  heading?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  inlineCode?: boolean;
  highlight?: boolean;
  color?: boolean;
  fontSize?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  taskList?: boolean;
  blockquote?: boolean;
  codeBlock?: boolean;
  horizontalRule?: boolean;
  align?: boolean;
  link?: boolean;
  table?: boolean;
  undoRedo?: boolean;
  characterCount?: boolean;
  image?: boolean | EditorImageOptions;
}

/** onChange 携带的完整上下文 */
export interface EditorChangeContext {
  /** ProseMirror 文档 JSON */
  json: JSONContent;
  /** HTML 字符串 */
  html: string;
  /** 纯文本 */
  text: string;
  /** 字符数（含空格） */
  characters: number;
  /** 单词数（中文按字计） */
  words: number;
}

export type EditorToolbarMode = 'fixed' | 'none';

export interface EditorProps {
  /** 受控值（HTML） */
  value?: string;
  /** 非受控初始值（HTML） */
  defaultValue?: string;
  /** 内容变化回调 */
  onChange?: (html: string, context: EditorChangeContext) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** 编辑区高度 */
  height?: number | string;
  /** 最小高度 */
  minHeight?: number;
  autoFocus?: boolean;
  /** 工具栏：固定 / 不显示 / 自定义节点 */
  toolbar?: EditorToolbarMode | false | React.ReactNode;
  features?: EditorFeatures;
  /** 语言，影响工具栏文案 */
  locale?: 'zh-CN' | 'en-US';
  className?: string;
  style?: React.CSSProperties;
  /** 编辑器实例就绪回调，可拿到 Tiptap 原生 API */
  onReady?: (editor: unknown) => void;
  /** 快捷键映射覆盖 */
  editorProps?: Record<string, unknown>;
}

export interface ResolvedImageFeature {
  enabled: boolean;
  /** 可选上传函数，未提供时只能填 URL */
  upload?: (file: File) => Promise<string>;
  accept: string;
}

export interface ResolvedFeatures extends Omit<EditorFeatures, 'image'> {
  image: ResolvedImageFeature;
}

/** 默认全开 */
export function resolveFeatures(
  features: EditorFeatures = {},
): ResolvedFeatures {
  const image = features.image;
  const imageOptions: EditorImageOptions =
    typeof image === 'object' ? image : { enabled: image !== false };

  return {
    heading: features.heading ?? true,
    bold: features.bold ?? true,
    italic: features.italic ?? true,
    underline: features.underline ?? true,
    strike: features.strike ?? true,
    inlineCode: features.inlineCode ?? true,
    highlight: features.highlight ?? true,
    color: features.color ?? true,
    fontSize: features.fontSize ?? true,
    subscript: features.subscript ?? true,
    superscript: features.superscript ?? true,
    bulletList: features.bulletList ?? true,
    orderedList: features.orderedList ?? true,
    taskList: features.taskList ?? true,
    blockquote: features.blockquote ?? true,
    codeBlock: features.codeBlock ?? true,
    horizontalRule: features.horizontalRule ?? true,
    align: features.align ?? true,
    link: features.link ?? true,
    table: features.table ?? true,
    undoRedo: features.undoRedo ?? true,
    characterCount: features.characterCount ?? true,
    image: {
      enabled: imageOptions.enabled ?? true,
      upload: imageOptions.upload,
      accept: imageOptions.accept ?? 'image/*',
    },
  };
}
