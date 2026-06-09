import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

/**
 * 动态向上查找包含 pnpm-workspace.yaml 的工作区根目录
 * @param startDir 起始查找目录
 */
export function findWorkspaceRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error('未找到 Aura 工作区根目录 (未检测到 pnpm-workspace.yaml)');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 缓存解析得到的工作区根目录绝对路径
export const workspaceRoot = findWorkspaceRoot(__dirname);

/**
 * 获取相对于 Aura 工作区根目录的绝对路径
 * @param paths 相对路径片段
 */
export function getWorkspacePath(...paths: string[]): string {
  return path.resolve(workspaceRoot, ...paths);
}
