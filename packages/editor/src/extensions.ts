import type { Extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import type { ResolvedFeatures } from './types';

/**
 * 扩展装配。
 *
 * 关键设计：**功能开关必须同时作用于「扩展注册」和「工具栏按钮」**。
 * 只隐藏按钮而不注销扩展，会导致用户仍能通过快捷键或粘贴触发该格式，
 * 产生「看起来关了其实没关」的隐性 bug。
 */

const lowlight = createLowlight(common);

export interface BuildExtensionsOptions {
  features: ResolvedFeatures;
  placeholder?: string;
}

export function buildExtensions({
  features,
  placeholder,
}: BuildExtensionsOptions): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      // 无论是否启用，都关闭 StarterKit 自带的代码块：
      // 启用时改用下面的 CodeBlockLowlight（带语法高亮），
      // 关闭时不注册任何代码块扩展。
      codeBlock: false,
      heading: features.heading ? { levels: [1, 2, 3, 4, 5, 6] } : false,
      bold: features.bold ? undefined : false,
      italic: features.italic ? undefined : false,
      strike: features.strike ? undefined : false,
      underline: features.underline ? undefined : false,
      code: features.inlineCode ? undefined : false,
      bulletList: features.bulletList ? undefined : false,
      orderedList: features.orderedList ? undefined : false,
      blockquote: features.blockquote ? undefined : false,
      horizontalRule: features.horizontalRule ? undefined : false,
      link: features.link
        ? {
            openOnClick: false,
            autolink: true,
            HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
          }
        : false,
      undoRedo: features.undoRedo ? undefined : false,
    }),
  ];

  if (features.codeBlock) {
    extensions.push(CodeBlockLowlight.configure({ lowlight }));
  }

  if (features.highlight || features.color || features.fontSize) {
    extensions.push(TextStyle);
  }

  if (features.color) {
    extensions.push(Color);
  }

  if (features.fontSize) {
    extensions.push(FontSize);
  }

  if (features.highlight) {
    extensions.push(Highlight.configure({ multicolor: true }));
  }

  if (features.subscript) extensions.push(Subscript);
  if (features.superscript) extensions.push(Superscript);

  if (features.align) {
    extensions.push(
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
    );
  }

  if (features.taskList) {
    extensions.push(TaskList, TaskItem.configure({ nested: true }));
  }

  if (features.image.enabled) {
    extensions.push(Image.configure({ inline: false, allowBase64: true }));
  }

  if (features.table) {
    extensions.push(
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: { class: 'aura-editor__table' },
        },
      }),
    );
  }

  if (features.characterCount) {
    extensions.push(CharacterCount);
  }

  extensions.push(
    Placeholder.configure({
      placeholder: placeholder ?? '请输入内容…',
      showOnlyWhenEditable: true,
    }),
  );

  return extensions;
}
