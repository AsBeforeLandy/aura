import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { classNames, prefixCls } from '@aura/shared';
import { CodeHighlighter } from '../code-highlighter';
import {
  addNodeAt,
  collectFolderKeys,
  extOf,
  findNode,
  isFolder,
  isSamePath,
  keyOfPath,
  languageOf,
  removeNodeAt,
  updateNodeAt,
} from './tree-utils';
import type {
  FileContentService,
  FolderDirectoryIcons,
  FolderPreviewFile,
  FolderPreviewRenderInfo,
  FolderRef,
  FolderSelectedFile,
  FolderTreeData,
} from './types';
import './index.less';

export type {
  FileContentService,
  FolderContextMenuItem,
  FolderDirectoryIcons,
  FolderPreviewFile,
  FolderPreviewRenderInfo,
  FolderRef,
  FolderSelectedFile,
  FolderTreeData,
} from './types';

/** 默认预览区在「未选中 / 选中文件夹」时的提示 */
const DEFAULT_PLACEHOLDER = '请选择一个文件';

type FolderMenuSpec =
  | MenuProps['items']
  | ((node: FolderTreeData, key: string) => MenuProps['items']);

export interface FolderProps {
  /** 文件树数据 */
  treeData?: FolderTreeData[];
  /** 是否开启选择 @default true */
  selectable?: boolean;
  /** 选中的文件路径（受控） */
  selectedFile?: string[];
  /** 默认选中的文件路径 @default [] */
  defaultSelectedFile?: string[];
  onSelectedFileChange?: (file: FolderSelectedFile) => void;
  /** 目录树宽度 @default 278 */
  directoryTreeWith?: number | string;
  /**
   * 空状态展示内容：
   * - 覆盖「树为空」与「未选中任何文件」两处默认提示
   * - 传 `false` 则不展示
   */
  emptyRender?: false | React.ReactNode | (() => React.ReactNode);
  /** 自定义预览内容；函数形式可拿到文件信息与默认预览节点 */
  previewRender?:
    | React.ReactNode
    | ((
        file: FolderPreviewFile,
        info: FolderPreviewRenderInfo,
      ) => React.ReactNode);
  /** 展开的节点 key 数组（受控）；key = path 数组以 `/` 连接 */
  expandedPaths?: string[];
  /** 默认展开的节点 key 数组 */
  defaultExpandedPaths?: string[];
  /** 是否默认展开全部文件夹 @default true */
  defaultExpandAll?: boolean;
  onExpandedPathsChange?: (paths: string[]) => void;
  /** 文件内容服务：文件没有内联 `content` 时按需拉取 */
  fileContentService?: FileContentService;
  onFileClick?: (filePath: string, content?: string) => void;
  onFolderClick?: (folderPath: string) => void;
  /** 目录树标题；传 `false` 不展示 */
  directoryTitle?: false | React.ReactNode | (() => React.ReactNode);
  /** 预览区标题；缺省用文件名，函数形式可自定义 */
  previewTitle?:
    | string
    | ((info: { title: string; path: string[]; content: string }) => React.ReactNode);
  /**
   * 图标配置：`false` 不展示图标；`directory` 键对应文件夹，
   * 其余键按**扩展名**匹配文件（如 `tsx`），未命中回退内置图标
   */
  directoryIcons?: FolderDirectoryIcons;
  /** 右键菜单：全局配置或按节点返回；节点自身的 `contextMenu` 优先级更高 */
  contextMenu?: FolderMenuSpec;
  onRightClick?: (info: { event: React.MouseEvent; node: FolderTreeData }) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** 文件夹图标（继承 currentColor） */
const FolderGlyph: React.FC = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false">
    <path d="M1.5 12.5v-9A1 1 0 0 1 2.5 2.5h3.2l1.3 1.6h6.5a1 1 0 0 1 1 1v7.4a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" />
  </svg>
);

/** 文件图标（继承 currentColor） */
const FileGlyph: React.FC = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M9 1.8H4.4a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1V5.2L9 1.8Z" />
    <path d="M9 1.8v3.4h3.6" />
  </svg>
);

function renderSlot(
  slot: false | React.ReactNode | (() => React.ReactNode),
): React.ReactNode {
  if (slot === false || slot === undefined) return null;
  return typeof slot === 'function' ? slot() : slot;
}

/**
 * Folder — 文件树。
 *
 * 左侧目录树 + 右侧文件预览：目录树支持展开 / 收起、选中、右键菜单与图标定制；
 * 预览区可选择内联 `content`，或通过 `fileContentService` 按需拉取。
 * 树的增删改用 `ref` 上的不可变换算方法完成（返回新 treeData，由调用方接管）。
 */
export const Folder = forwardRef<FolderRef, FolderProps>(
  (
    {
      treeData = [],
      selectable = true,
      selectedFile,
      defaultSelectedFile = [],
      onSelectedFileChange,
      directoryTreeWith = 278,
      emptyRender,
      previewRender,
      expandedPaths,
      defaultExpandedPaths,
      defaultExpandAll = true,
      onExpandedPathsChange,
      fileContentService,
      onFileClick,
      onFolderClick,
      directoryTitle,
      previewTitle,
      directoryIcons,
      contextMenu,
      onRightClick,
      className,
      style,
    },
    ref,
  ) => {
    const [innerSelected, setInnerSelected] = useState<string[]>(
      defaultSelectedFile,
    );
    const [innerExpanded, setInnerExpanded] = useState<Set<string>>(() => {
      if (defaultExpandedPaths) return new Set(defaultExpandedPaths);
      return defaultExpandAll ? new Set(collectFolderKeys(treeData)) : new Set();
    });
    const [content, setContent] = useState<{
      status: 'idle' | 'loading' | 'ready' | 'error';
      text?: string;
      error?: string;
    }>({ status: 'idle' });

    const isSelectedControlled = selectedFile !== undefined;
    const activePath = isSelectedControlled ? selectedFile : innerSelected;
    const isExpandedControlled = expandedPaths !== undefined;
    const expanded = useMemo(
      () => (isExpandedControlled ? new Set(expandedPaths) : innerExpanded),
      [isExpandedControlled, expandedPaths, innerExpanded],
    );

    const selectedNode = useMemo(
      () => findNode(treeData, activePath),
      [treeData, activePath],
    );
    const selectedKey = keyOfPath(activePath);
    const selectedName = selectedNode?.title ?? '';

    // ===== 预览内容解析：内联 content 优先，其次交给 fileContentService =====
    useEffect(() => {
      if (!selectedNode || isFolder(selectedNode)) {
        setContent({ status: 'idle' });
        return undefined;
      }
      if (selectedNode.content !== undefined) {
        setContent({ status: 'ready', text: selectedNode.content });
        return undefined;
      }
      if (!fileContentService) {
        setContent({ status: 'ready', text: '' });
        return undefined;
      }

      let cancelled = false;
      setContent({ status: 'loading' });
      fileContentService
        .loadFileContent(selectedKey)
        .then((text) => {
          if (!cancelled) setContent({ status: 'ready', text });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setContent({
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          });
        });

      return () => {
        cancelled = true;
      };
    }, [selectedNode, selectedKey, fileContentService]);

    const toggleExpand = useCallback(
      (key: string) => {
        const next = new Set(expanded);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        if (!isExpandedControlled) setInnerExpanded(next);
        onExpandedPathsChange?.([...next]);
      },
      [expanded, isExpandedControlled, onExpandedPathsChange],
    );

    const select = useCallback(
      (node: FolderTreeData, path: string[]) => {
        if (!selectable) return;
        const folder = isFolder(node);
        if (!isSelectedControlled) setInnerSelected(path);

        if (folder) onFolderClick?.(keyOfPath(path));
        else onFileClick?.(keyOfPath(path), node.content);

        onSelectedFileChange?.({
          path,
          name: node.title,
          ...(folder ? {} : { content: node.content }),
        });
      },
      [
        selectable,
        isSelectedControlled,
        onFolderClick,
        onFileClick,
        onSelectedFileChange,
      ],
    );

    const activate = useCallback(
      (node: FolderTreeData, path: string[]) => {
        if (isFolder(node)) toggleExpand(keyOfPath(path));
        select(node, path);
      },
      [toggleExpand, select],
    );

    useImperativeHandle(
      ref,
      () => ({
        getNode: (path) => findNode(treeData, path),
        updateNode: (path, data) => updateNodeAt(treeData, path, data),
        deleteNode: (path) => removeNodeAt(treeData, path),
        addNode: (parentPath, node) => addNodeAt(treeData, parentPath, node),
      }),
      [treeData],
    );

    const resolveIcon = (node: FolderTreeData): React.ReactNode => {
      if (directoryIcons === false) return null;
      const folder = isFolder(node);

      if (directoryIcons) {
        const spec = folder
          ? directoryIcons.directory
          : directoryIcons[extOf(node.title)];
        if (spec !== undefined) {
          return typeof spec === 'function' ? spec() : spec;
        }
      }
      return folder ? <FolderGlyph /> : <FileGlyph />;
    };

    const resolveMenu = (
      node: FolderTreeData,
      key: string,
    ): MenuProps['items'] | undefined => {
      if (node.contextMenu === false) return undefined;
      const spec = node.contextMenu ?? contextMenu;
      if (!spec) return undefined;
      if (typeof spec === 'function') {
        // antd 的 ItemType 本身也可能是函数（自定义渲染），TS 无法据此区分出
        // 我们的自定义签名，这里显式标注后调用，避免把两者求成交集类型。
        const resolve = spec as (
          current: FolderTreeData,
          currentKey: string,
        ) => MenuProps['items'];
        return resolve(node, key) ?? undefined;
      }
      return spec;
    };

    const renderNodes = (
      nodes: FolderTreeData[],
      parentPath: string[],
      level: number,
    ): React.ReactNode =>
      nodes.map((node) => {
        const path = [...parentPath, node.path];
        const key = keyOfPath(path);
        const folder = isFolder(node);
        const open = expanded.has(key);
        const selected = isSamePath(path, activePath);
        const menu = resolveMenu(node, key);

        const row = (
          <div
            role="treeitem"
            aria-level={level}
            aria-selected={selected}
            aria-expanded={folder ? open : undefined}
            tabIndex={0}
            className={classNames(
              prefixCls('x-folder-node'),
              selected && prefixCls('x-folder-node--selected'),
              folder && prefixCls('x-folder-node--folder'),
            )}
            onClick={() => activate(node, path)}
            onContextMenu={(event) => {
              onRightClick?.({ event, node });
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activate(node, path);
                return;
              }
              if (!folder) return;
              if (event.key === 'ArrowRight' && !open) {
                event.preventDefault();
                toggleExpand(key);
              }
              if (event.key === 'ArrowLeft' && open) {
                event.preventDefault();
                toggleExpand(key);
              }
            }}
          >
            <span
              className={prefixCls('x-folder-caret')}
              data-open={folder ? open : undefined}
              aria-hidden="true"
            >
              {folder ? (open ? '▾' : '▸') : ''}
            </span>
            <span className={prefixCls('x-folder-node-icon')} aria-hidden="true">
              {resolveIcon(node)}
            </span>
            <span className={prefixCls('x-folder-node-title')}>{node.title}</span>
          </div>
        );

        return (
          <React.Fragment key={key}>
            {menu ? (
              <Dropdown menu={{ items: menu }} trigger={['contextMenu']}>
                {row}
              </Dropdown>
            ) : (
              row
            )}
            {folder && open && (node.children?.length ?? 0) > 0 ? (
              <div role="group">{renderNodes(node.children ?? [], path, level + 1)}</div>
            ) : null}
          </React.Fragment>
        );
      });

    const fileInfo: FolderPreviewFile = {
      content: content.text,
      path: activePath,
      title: selectedName || undefined,
      language: languageOf(selectedName),
    };

    const emptyNode = (() => {
      if (emptyRender === false) return null;
      if (emptyRender !== undefined) return renderSlot(emptyRender);
      return <div className={prefixCls('x-folder-empty')}>{DEFAULT_PLACEHOLDER}</div>;
    })();

    const originPreview = (() => {
      if (!selectedNode) return emptyNode;
      if (isFolder(selectedNode)) {
        if (emptyRender === false) return null;
        return (
          <div className={prefixCls('x-folder-empty')}>
            {emptyRender !== undefined
              ? renderSlot(emptyRender)
              : `文件夹 · ${selectedNode.children?.length ?? 0} 项`}
          </div>
        );
      }
      if (content.status === 'loading') {
        return (
          <div className={prefixCls('x-folder-loading')} aria-busy="true">
            正在加载文件内容…
          </div>
        );
      }
      if (content.status === 'error') {
        return (
          <div className={prefixCls('x-folder-error')} role="alert">
            {content.error}
          </div>
        );
      }
      return (
        <CodeHighlighter lang={fileInfo.language} header={false}>
          {content.text ?? ''}
        </CodeHighlighter>
      );
    })();

    const previewBody =
      previewRender === undefined
        ? originPreview
        : typeof previewRender === 'function'
          ? previewRender(fileInfo, { originNode: originPreview })
          : previewRender;

    const previewTitleNode = (() => {
      if (previewTitle === undefined) {
        return selectedName ? (
          <span className={prefixCls('x-folder-preview-title')}>{selectedName}</span>
        ) : null;
      }
      if (typeof previewTitle === 'function') {
        return previewTitle({
          title: selectedName,
          path: activePath,
          content: content.text ?? '',
        });
      }
      return <span className={prefixCls('x-folder-preview-title')}>{previewTitle}</span>;
    })();

    return (
      <div
        className={classNames(prefixCls('x-folder'), className)}
        style={style}
      >
        <div
          className={prefixCls('x-folder-directory')}
          style={{ width: directoryTreeWith }}
        >
          {directoryTitle !== false ? (
            <div className={prefixCls('x-folder-directory-title')}>
              {directoryTitle === undefined ? '文件' : renderSlot(directoryTitle)}
            </div>
          ) : null}
          {treeData.length === 0 ? (
            emptyRender === false ? null : (
              <div className={prefixCls('x-folder-empty')}>
                {emptyRender !== undefined ? renderSlot(emptyRender) : '暂无文件'}
              </div>
            )
          ) : (
            <div
              role="tree"
              aria-label="文件树"
              className={prefixCls('x-folder-tree')}
            >
              {renderNodes(treeData, [], 1)}
            </div>
          )}
        </div>

        <div className={prefixCls('x-folder-preview')}>
          {previewTitleNode ? (
            <div className={prefixCls('x-folder-preview-header')}>
              {previewTitleNode}
            </div>
          ) : null}
          <div className={prefixCls('x-folder-preview-body')}>{previewBody}</div>
        </div>
      </div>
    );
  },
);

Folder.displayName = 'Folder';
