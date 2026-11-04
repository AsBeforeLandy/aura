import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import {
  EditorContent,
  useEditor,
  type Editor as TiptapEditor,
} from '@tiptap/react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import { buildExtensions } from '../extensions';
import { Toolbar } from '../toolbar';
import {
  resolveFeatures,
  type EditorChangeContext,
  type EditorProps,
} from '../types';
import '../editor.less';

/**
 * Aura 富文本编辑器。
 *
 * 引擎选型：Tiptap / ProseMirror（headless）。
 * 理由：编辑器的真正难点不在 UI 而在文档模型 —— 光标映射、输入法合成、
 * 撤销栈一致性、粘贴内容清洗，自研等于重写 ProseMirror。
 * headless 的 ProseMirror 恰好把「模型」交给引擎、「外观」留给我们，
 * 因此能完整套用 Aura 设计令牌而不被第三方样式绑架。
 *
 * 受控语义与 React 一致：
 *   · 传 value → 受控，外部改 value 会同步进编辑器；
 *   · 传 defaultValue → 非受控，后续改 defaultValue 不再影响内容。
 */
export function Editor({
  value,
  defaultValue = '',
  onChange,
  placeholder,
  readOnly = false,
  height = 420,
  minHeight = 160,
  autoFocus = false,
  toolbar = 'fixed',
  features,
  locale = 'zh-CN',
  className,
  style,
  onReady,
}: EditorProps) {
  const resolved = useMemo(() => resolveFeatures(features), [features]);

  /**
   * 用序列化后的字符串做重建依赖。
   * 直接把 resolved 对象放进依赖数组会让「每次渲染传入内联 features」
   * 都重建编辑器实例 —— 光标与撤销栈随之丢失。
   */
  const featuresKey = JSON.stringify(resolved);

  const extensions = useMemo(
    () => buildExtensions({ features: resolved, placeholder }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [featuresKey, placeholder],
  );

  const [, forceRender] = useReducer((tick: number) => tick + 1, 0);

  // 用 ref 持有回调，避免 onChange 每次渲染变化都触发编辑器重建
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const editor = useEditor(
    {
      extensions,
      content: value ?? defaultValue,
      editable: !readOnly,
      // SSR 下必须关闭立即渲染，否则服务端与客户端 DOM 不一致
      immediatelyRender: false,
      autofocus: autoFocus,
      editorProps: {
        attributes: {
          class: prefixCls('editor__content'),
          spellcheck: 'false',
        },
      },
      onUpdate: ({ editor: instance }) => {
        const count = instance.storage.characterCount as
          { characters: () => number; words: () => number } | undefined;
        const context: EditorChangeContext = {
          json: instance.getJSON(),
          html: instance.getHTML(),
          text: instance.getText(),
          characters: count?.characters() ?? instance.getText().length,
          words:
            count?.words() ??
            instance.getText().split(/\s+/).filter(Boolean).length,
        };
        onChangeRef.current?.(context.html, context);
      },
    },
    [extensions],
  );

  // 工具栏的激活态依赖编辑器状态，需要订阅事务手动刷新
  useEffect(() => {
    if (!editor) return undefined;
    const handler = () => forceRender();
    editor.on('transaction', handler);
    editor.on('selectionUpdate', handler);
    return () => {
      editor.off('transaction', handler);
      editor.off('selectionUpdate', handler);
    };
  }, [editor]);

  // 受控同步：外部 value 变化时写入编辑器（不触发 onChange，避免回环）
  useEffect(() => {
    if (!editor || value === undefined) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [readOnly, editor]);

  useEffect(() => {
    if (editor) onReadyRef.current?.(editor as TiptapEditor);
  }, [editor]);

  const count = editor?.storage.characterCount as
    { characters: () => number; words: () => number } | undefined;
  const characters = count?.characters() ?? 0;

  const customToolbar =
    typeof toolbar === 'object' && toolbar !== null ? toolbar : null;

  return (
    <div
      className={classNames(prefixCls('editor'), className)}
      style={style}
      data-readonly={readOnly || undefined}
    >
      {toolbar === 'fixed' && editor && !readOnly ? (
        <Toolbar editor={editor} features={resolved} locale={locale} />
      ) : null}
      {customToolbar}

      <div className={prefixCls('editor__body')} style={{ height, minHeight }}>
        <EditorContent editor={editor} />
      </div>

      {resolved.characterCount ? (
        <div className={prefixCls('editor__footer')}>
          <span>
            {locale === 'en-US'
              ? `${characters} characters`
              : `${characters} 字`}
          </span>
        </div>
      ) : null}
    </div>
  );
}
