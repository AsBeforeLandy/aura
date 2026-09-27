import type React from 'react';
import type { MenuProps } from 'antd';

/** 右键菜单项：沿用 antd Menu 的 items 结构 */
export type FolderContextMenuItem =
  | MenuProps['items']
  | false
  | ((key: string) => MenuProps['items']);

export interface FolderTreeData {
  /** 显示名称 */
  title: string;
  /**
   * 节点自身的路径标识，需在**同级中唯一**。
   * 选中 / 展开 / `ref.getNode` 用的都是「从根到该节点的 path 依次拼接」的数组。
   */
  path: string;
  /** 文件内容；给了就不必再配 `fileContentService` */
  content?: string;
  /** 子节点；仅文件夹有意义。空数组按「空文件夹」处理，仍可展开 */
  children?: FolderTreeData[];
  /** 该节点的右键菜单；优先级高于全局 `contextMenu`，传 `false` 禁用 */
  contextMenu?: FolderContextMenuItem;
}

/** 选中的文件信息 */
export interface FolderSelectedFile {
  /** 从根到选中节点的 path 数组 */
  path: string[];
  name?: string;
  content?: string;
}

export interface FolderPreviewFile {
  content?: string;
  path: string[];
  title?: React.ReactNode;
  /** 由扩展名推导，用于代码高亮 */
  language: string;
}

export interface FolderPreviewRenderInfo {
  originNode: React.ReactNode;
}

/** 文件内容服务：按需拉取文件内容（懒加载大文件树时用） */
export interface FileContentService {
  loadFileContent(filePath: string): Promise<string>;
}

export type FolderDirectoryIcons =
  | false
  | Record<string, React.ReactNode | (() => React.ReactNode)>;

export interface FolderRef {
  /** 按路径取节点 */
  getNode: (path: string[]) => FolderTreeData | undefined;
  /** 不可变更新：把 `data` 合并到目标节点，返回新的 treeData */
  updateNode: (
    path: string[],
    data: Partial<FolderTreeData>,
  ) => FolderTreeData[];
  /** 不可变删除：返回新的 treeData */
  deleteNode: (path: string[]) => FolderTreeData[];
  /** 不可变新增：在目标文件夹下追加子节点，返回新的 treeData */
  addNode: (parentPath: string[], node: FolderTreeData) => FolderTreeData[];
}
