import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'fs';
import path from 'path';
import { getWorkspacePath } from '../../utils/paths.js';

function getPublicDir(): string {
  return getWorkspacePath('public');
}

function getUiSourceDir(): string {
  return getWorkspacePath('packages/ui/src');
}

/**
 * 从 llms.txt 读取组件列表
 */
function readLlmsList(): string | null {
  const filePath = path.join(getPublicDir(), 'llms.txt');
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 从 packages/ui/src/index.ts 提取组件列表（fallback）
 */
function getComponentListFromSource(): string {
  const uiSourceDir = getUiSourceDir();
  const indexPath = path.join(uiSourceDir, 'index.ts');

  if (!fs.existsSync(indexPath)) {
    return '未找到 packages/ui/src/index.ts';
  }

  const content = fs.readFileSync(indexPath, 'utf-8');
  const components: string[] = [];

  const exportRegex = /export\s+\{[^}]*\}\s+from\s+'\.\/([^']+)'/g;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(content)) !== null) {
    const componentName = match[1];
    if (componentName === 'theme') continue;
    components.push(componentName);
  }

  return `Aura 组件列表（共 ${components.length} 个）：\n\n${components.map((c) => `- ${c}`).join('\n')}`;
}

export function registerListTool(server: McpServer): void {
  server.tool('aura_list', '列出所有 Aura 组件。优先从 llms.txt 读取，回退到源码解析。', {}, async () => {
    // 优先使用 llms.txt
    const llmsResult = readLlmsList();
    if (llmsResult) {
      return {
        content: [{ type: 'text' as const, text: llmsResult }],
      };
    }

    // fallback 到源码提取
    const result = getComponentListFromSource();
    return {
      content: [{ type: 'text' as const, text: result }],
    };
  });
}
