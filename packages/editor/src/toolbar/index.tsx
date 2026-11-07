import React, { useCallback, useEffect, useRef, useState } from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import type { Editor as TiptapEditor } from '@tiptap/react';
import type { ResolvedFeatures } from '../types';
import {
  canMergeTableColumn,
  canMergeTableRow,
  canSplitTableCell,
  mergeTableColumn,
  mergeTableRow,
  splitTableCell,
} from '../table-merge';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ClearIcon,
  CodeBlockIcon,
  CodeIcon,
  DividerIcon,
  HighlightIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  ListOrderedIcon,
  ListTaskIcon,
  PaletteIcon,
  QuoteIcon,
  RedoIcon,
  StrikeIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TableIcon,
  UnderlineIcon,
  UndoIcon,
} from '../icons';

export interface ToolbarProps {
  editor: TiptapEditor;
  features: ResolvedFeatures;
  locale: 'zh-CN' | 'en-US';
}

const TEXT = {
  'zh-CN': {
    undo: '撤销',
    redo: '重做',
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    strike: '删除线',
    inlineCode: '行内代码',
    highlight: '高亮',
    color: '文字颜色',
    fontSize: '字号',
    subscript: '下标',
    superscript: '上标',
    bulletList: '无序列表',
    orderedList: '有序列表',
    taskList: '任务列表',
    blockquote: '引用',
    codeBlock: '代码块',
    horizontalRule: '分割线',
    alignLeft: '左对齐',
    alignCenter: '居中对齐',
    alignRight: '右对齐',
    alignJustify: '两端对齐',
    link: '链接',
    linkPlaceholder: '输入链接地址，留空则移除链接',
    image: '图片',
    imagePlaceholder: '输入图片地址',
    upload: '上传图片',
    insert: '确定',
    cancel: '取消',
    table: '表格',
    addRow: '加行',
    addColumn: '加列',
    deleteRow: '删行',
    deleteColumn: '删列',
    deleteTable: '删表格',
    mergeRow: '合并行',
    mergeColumn: '合并列',
    splitCell: '拆分',
    clear: '清除格式',
    paragraph: '正文',
    headings: '标题',
  },
  'en-US': {
    undo: 'Undo',
    redo: 'Redo',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    inlineCode: 'Inline code',
    highlight: 'Highlight',
    color: 'Text color',
    fontSize: 'Font size',
    subscript: 'Subscript',
    superscript: 'Superscript',
    bulletList: 'Bullet list',
    orderedList: 'Numbered list',
    taskList: 'Task list',
    blockquote: 'Quote',
    codeBlock: 'Code block',
    horizontalRule: 'Divider',
    alignLeft: 'Align left',
    alignCenter: 'Align center',
    alignRight: 'Align right',
    alignJustify: 'Justify',
    link: 'Link',
    linkPlaceholder: 'Enter URL, leave empty to remove',
    image: 'Image',
    imagePlaceholder: 'Enter image URL',
    upload: 'Upload',
    insert: 'Apply',
    cancel: 'Cancel',
    table: 'Table',
    addRow: 'Add row',
    addColumn: 'Add column',
    deleteRow: 'Delete row',
    deleteColumn: 'Delete column',
    deleteTable: 'Delete table',
    mergeRow: 'Merge row',
    mergeColumn: 'Merge column',
    splitCell: 'Split',
    clear: 'Clear format',
    paragraph: 'Paragraph',
    headings: 'Heading',
  },
} as const;

interface ToolButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      className={classNames(
        prefixCls('editor__tool'),
        active && prefixCls('editor__tool--active'),
      )}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // 关键：阻止默认行为，否则点按钮会先让编辑区失焦、选区丢失
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** 轻量气泡：点击外部或 Esc 关闭 */
function Popover({
  trigger,
  children,
  align = 'left',
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (props: { close: () => void }) => React.ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={prefixCls('editor__popover-wrap')} ref={ref}>
      {trigger({ open, toggle: () => setOpen((prev) => !prev) })}
      {open ? (
        <div
          className={classNames(
            prefixCls('editor__popover'),
            align === 'right' && prefixCls('editor__popover--right'),
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      ) : null}
    </div>
  );
}

const FONT_SIZES = [
  '12px',
  '13px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '30px',
];

/**
 * 固定工具栏。
 *
 * 分组顺序遵循「先操作，后格式，再结构」：
 * 撤销重做 → 块级类型 → 行内样式 → 对齐 → 列表 → 块结构 → 插入 → 清理。
 */
export function Toolbar({ editor, features, locale }: ToolbarProps) {
  const t = TEXT[locale] ?? TEXT['zh-CN'];

  const setLink = useCallback(
    (url: string) => {
      const chain = editor.chain().focus().extendMarkRange('link');
      if (!url) chain.unsetLink().run();
      else chain.setLink({ href: url }).run();
    },
    [editor],
  );

  const insertImage = useCallback(
    (src: string) => {
      if (!src) return;
      editor.chain().focus().setImage({ src }).run();
    },
    [editor],
  );

  const handleUpload = useCallback(
    async (file: File) => {
      const upload = features.image.upload;
      if (!upload) return;
      const url = await upload(file);
      insertImage(url);
    },
    [features.image.upload, insertImage],
  );

  const headingValue = (() => {
    for (let level = 1; level <= 6; level += 1) {
      if (editor.isActive('heading', { level })) return String(level);
    }
    return '0';
  })();

  const inTable = editor.isActive('table');

  return (
    <div
      className={prefixCls('editor__toolbar')}
      role="toolbar"
      aria-label="编辑器工具栏"
    >
      {features.undoRedo && (
        <div className={prefixCls('editor__group')}>
          <ToolButton
            label={t.undo}
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <UndoIcon />
          </ToolButton>
          <ToolButton
            label={t.redo}
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <RedoIcon />
          </ToolButton>
        </div>
      )}

      {features.heading && (
        <div className={prefixCls('editor__group')}>
          <select
            className={prefixCls('editor__select')}
            aria-label={t.headings}
            value={headingValue}
            onChange={(event) => {
              const level = Number(event.target.value);
              if (level === 0) editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                  .run();
            }}
          >
            <option value="0">{t.paragraph}</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
            <option value="5">H5</option>
            <option value="6">H6</option>
          </select>
        </div>
      )}

      <div className={prefixCls('editor__group')}>
        {features.bold && (
          <ToolButton
            label={t.bold}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon />
          </ToolButton>
        )}
        {features.italic && (
          <ToolButton
            label={t.italic}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon />
          </ToolButton>
        )}
        {features.underline && (
          <ToolButton
            label={t.underline}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </ToolButton>
        )}
        {features.strike && (
          <ToolButton
            label={t.strike}
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikeIcon />
          </ToolButton>
        )}
        {features.inlineCode && (
          <ToolButton
            label={t.inlineCode}
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <CodeIcon />
          </ToolButton>
        )}
        {features.subscript && (
          <ToolButton
            label={t.subscript}
            active={editor.isActive('subscript')}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            <SubscriptIcon />
          </ToolButton>
        )}
        {features.superscript && (
          <ToolButton
            label={t.superscript}
            active={editor.isActive('superscript')}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <SuperscriptIcon />
          </ToolButton>
        )}
      </div>

      {(features.color || features.highlight || features.fontSize) && (
        <div className={prefixCls('editor__group')}>
          {features.highlight && (
            <ToolButton
              label={t.highlight}
              active={editor.isActive('highlight')}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: '#fef08a' })
                  .run()
              }
            >
              <HighlightIcon />
            </ToolButton>
          )}
          {features.color && (
            <label className={prefixCls('editor__color')} title={t.color}>
              <PaletteIcon />
              <input
                type="color"
                aria-label={t.color}
                value={editor.getAttributes('textStyle').color ?? '#111827'}
                onChange={(event) =>
                  editor.chain().focus().setColor(event.target.value).run()
                }
              />
            </label>
          )}
          {features.fontSize && (
            <select
              className={classNames(
                prefixCls('editor__select'),
                prefixCls('editor__select--sm'),
              )}
              aria-label={t.fontSize}
              value={editor.getAttributes('textStyle').fontSize ?? ''}
              onChange={(event) => {
                const size = event.target.value;
                const chain = editor.chain().focus();
                if (!size) chain.unsetFontSize().run();
                else chain.setFontSize(size).run();
              }}
            >
              <option value="">—</option>
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size.replace('px', '')}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {features.align && (
        <div className={prefixCls('editor__group')}>
          <ToolButton
            label={t.alignLeft}
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeftIcon />
          </ToolButton>
          <ToolButton
            label={t.alignCenter}
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenterIcon />
          </ToolButton>
          <ToolButton
            label={t.alignRight}
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRightIcon />
          </ToolButton>
        </div>
      )}

      <div className={prefixCls('editor__group')}>
        {features.bulletList && (
          <ToolButton
            label={t.bulletList}
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListBulletIcon />
          </ToolButton>
        )}
        {features.orderedList && (
          <ToolButton
            label={t.orderedList}
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon />
          </ToolButton>
        )}
        {features.taskList && (
          <ToolButton
            label={t.taskList}
            active={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ListTaskIcon />
          </ToolButton>
        )}
      </div>

      <div className={prefixCls('editor__group')}>
        {features.blockquote && (
          <ToolButton
            label={t.blockquote}
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <QuoteIcon />
          </ToolButton>
        )}
        {features.codeBlock && (
          <ToolButton
            label={t.codeBlock}
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <CodeBlockIcon />
          </ToolButton>
        )}
        {features.horizontalRule && (
          <ToolButton
            label={t.horizontalRule}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <DividerIcon />
          </ToolButton>
        )}
      </div>

      <div className={prefixCls('editor__group')}>
        {features.link && (
          <Popover
            trigger={({ open, toggle }) => (
              <ToolButton
                label={t.link}
                active={editor.isActive('link') || open}
                onClick={toggle}
              >
                <LinkIcon />
              </ToolButton>
            )}
          >
            {({ close }) => (
              <form
                className={prefixCls('editor__form')}
                onSubmit={(event) => {
                  event.preventDefault();
                  const input =
                    (event.currentTarget.elements.namedItem(
                      'url',
                    ) as HTMLInputElement) ?? null;
                  setLink(input?.value.trim() ?? '');
                  close();
                }}
              >
                <input
                  name="url"
                  className={prefixCls('editor__input')}
                  placeholder={t.linkPlaceholder}
                  defaultValue={
                    (editor.getAttributes('link').href as string) ?? ''
                  }
                  autoFocus
                />
                <button type="submit" className={prefixCls('editor__primary')}>
                  {t.insert}
                </button>
              </form>
            )}
          </Popover>
        )}

        {features.image.enabled && (
          <Popover
            trigger={({ open, toggle }) => (
              <ToolButton label={t.image} active={open} onClick={toggle}>
                <ImageIcon />
              </ToolButton>
            )}
          >
            {({ close }) => (
              <form
                className={classNames(
                  prefixCls('editor__form'),
                  prefixCls('editor__form--column'),
                )}
                onSubmit={(event) => {
                  event.preventDefault();
                  const input =
                    (event.currentTarget.elements.namedItem(
                      'src',
                    ) as HTMLInputElement) ?? null;
                  insertImage(input?.value.trim() ?? '');
                  close();
                }}
              >
                <input
                  name="src"
                  className={prefixCls('editor__input')}
                  placeholder={t.imagePlaceholder}
                  autoFocus
                />
                <div className={prefixCls('editor__form-row')}>
                  {features.image.upload && (
                    <label className={prefixCls('editor__secondary')}>
                      {t.upload}
                      <input
                        type="file"
                        accept={features.image.accept}
                        hidden
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) await handleUpload(file);
                          close();
                        }}
                      />
                    </label>
                  )}
                  <button
                    type="submit"
                    className={prefixCls('editor__primary')}
                  >
                    {t.insert}
                  </button>
                </div>
              </form>
            )}
          </Popover>
        )}

        {features.table && (
          <ToolButton
            label={t.table}
            active={inTable}
            onClick={() =>
              inTable
                ? editor.chain().focus().deleteTable().run()
                : editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
            }
          >
            <TableIcon />
          </ToolButton>
        )}
      </div>

      {inTable && features.table && (
        <div
          className={classNames(
            prefixCls('editor__group'),
            prefixCls('editor__group--table'),
          )}
        >
          <button
            type="button"
            className={prefixCls('editor__mini')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            {t.addRow}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            {t.addColumn}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            {t.deleteRow}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            {t.deleteColumn}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            disabled={!canMergeTableRow(editor)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => mergeTableRow(editor)}
          >
            {t.mergeRow}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            disabled={!canMergeTableColumn(editor)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => mergeTableColumn(editor)}
          >
            {t.mergeColumn}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            disabled={!canSplitTableCell(editor)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => splitTableCell(editor)}
          >
            {t.splitCell}
          </button>
          <button
            type="button"
            className={prefixCls('editor__mini')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            {t.deleteTable}
          </button>
        </div>
      )}

      <div className={prefixCls('editor__group')}>
        <ToolButton
          label={t.clear}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <ClearIcon />
        </ToolButton>
      </div>
    </div>
  );
}
