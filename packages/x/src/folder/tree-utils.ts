import type { FolderTreeData } from './types';

/**
 * 路径 key：把 `path` 数组拼成稳定字符串，用作 Set / Map 的键与 DOM id 片段。
 * 分隔符用 `/`——与文件系统习惯一致，也便于文档里肉眼核对。
 */
export const keyOfPath = (path: string[]): string => path.join('/');

/** 两个路径是否指向同一节点 */
export const isSamePath = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((segment, index) => segment === b[index]);

/** 是否为文件夹（有 `children` 字段即为文件夹，空数组也算） */
export const isFolder = (node: FolderTreeData): boolean =>
  Array.isArray(node.children);

/**
 * 收集所有文件夹的 key。
 * 语义上与 antdx 的「默认展开全部」一致：**叶子节点不在其中**。
 */
export function collectFolderKeys(
  tree: FolderTreeData[],
  parentPath: string[] = [],
  out: string[] = [],
): string[] {
  for (const node of tree) {
    const path = [...parentPath, node.path];
    if (isFolder(node)) {
      out.push(keyOfPath(path));
      collectFolderKeys(node.children ?? [], path, out);
    }
  }
  return out;
}

/** 按路径找节点 */
export function findNode(
  tree: FolderTreeData[],
  path: string[],
): FolderTreeData | undefined {
  if (path.length === 0) return undefined;
  const [head, ...rest] = path;
  const match = tree.find((node) => node.path === head);
  if (!match) return undefined;
  if (rest.length === 0) return match;
  return findNode(match.children ?? [], rest);
}

/**
 * 不可变更新：把 `data` 合并进目标节点，返回新树。
 * 目标不存在时原样返回（引用不变，便于调用方做浅比较）。
 */
export function updateNodeAt(
  tree: FolderTreeData[],
  path: string[],
  data: Partial<FolderTreeData>,
): FolderTreeData[] {
  if (path.length === 0) return tree;
  const [head, ...rest] = path;
  let changed = false;

  const next = tree.map((node) => {
    if (node.path !== head) return node;
    if (rest.length === 0) {
      changed = true;
      return { ...node, ...data };
    }
    const children = updateNodeAt(node.children ?? [], rest, data);
    if (children === (node.children ?? [])) return node;
    changed = true;
    return { ...node, children };
  });

  return changed ? next : tree;
}

/** 不可变删除：返回新树；目标不存在时原样返回 */
export function removeNodeAt(
  tree: FolderTreeData[],
  path: string[],
): FolderTreeData[] {
  if (path.length === 0) return tree;
  const [head, ...rest] = path;

  if (rest.length === 0) {
    const index = tree.findIndex((node) => node.path === head);
    if (index === -1) return tree;
    return [...tree.slice(0, index), ...tree.slice(index + 1)];
  }

  let changed = false;
  const next = tree.map((node) => {
    if (node.path !== head || !isFolder(node)) return node;
    const children = removeNodeAt(node.children ?? [], rest);
    if (children === (node.children ?? [])) return node;
    changed = true;
    return { ...node, children };
  });

  return changed ? next : tree;
}

/** 不可变新增：在目标文件夹的子节点末尾追加；父节点不存在或不是文件夹时原样返回 */
export function addNodeAt(
  tree: FolderTreeData[],
  parentPath: string[],
  node: FolderTreeData,
): FolderTreeData[] {
  if (parentPath.length === 0) return [...tree, node];

  const [head, ...rest] = parentPath;
  let changed = false;

  const next = tree.map((current) => {
    if (current.path !== head || !isFolder(current)) return current;
    if (rest.length === 0) {
      changed = true;
      return { ...current, children: [...(current.children ?? []), node] };
    }
    const children = addNodeAt(current.children ?? [], rest, node);
    if (children === (current.children ?? [])) return current;
    changed = true;
    return { ...current, children };
  });

  return changed ? next : tree;
}

/** 取文件扩展名（小写）；无扩展名返回空串 */
export function extOf(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase();
}

/** 扩展名 → 高亮语言，供预览区做语法着色 */
export function languageOf(name: string): string {
  const ext = extOf(name);
  const map: Record<string, string> = {
    js: 'javascript',
    cjs: 'javascript',
    mjs: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    json: 'json',
    css: 'css',
    less: 'less',
    scss: 'scss',
    html: 'markup',
    htm: 'markup',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash',
    bash: 'bash',
    py: 'python',
    go: 'go',
    sql: 'sql',
  };
  return map[ext] ?? 'text';
}
