import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
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
 * 从 llms-full.txt 提取组件文档（含 API + Usage）
 */
function extractFromLlmsFull(componentName: string): string | null {
  const filePath = path.join(getPublicDir(), 'llms-full.txt');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  const nameCap = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  const regex = new RegExp(`## ${nameCap}[\\s\\S]*?(?=\\n## [A-Z]|$)`, 'm');
  const match = content.match(regex);
  return match ? match[0].trim() : null;
}

/**
 * 从组件源码目录读取 index.md + demo/basic.tsx（fallback）
 */
function extractFromSource(componentName: string): string {
  const componentDir = path.join(getUiSourceDir(), componentName);

  if (!fs.existsSync(componentDir)) {
    return `错误：未找到组件 "${componentName}" 的目录。`;
  }

  const parts: string[] = [];

  const mdPath = path.join(componentDir, 'index.md');
  if (fs.existsSync(mdPath)) {
    parts.push(fs.readFileSync(mdPath, 'utf-8'));
  }

  const demoPath = path.join(componentDir, 'demo', 'basic.tsx');
  if (fs.existsSync(demoPath)) {
    parts.push(`\n## Demo\n\n\`\`\`tsx\n${fs.readFileSync(demoPath, 'utf-8')}\n\`\`\``);
  }

  if (parts.length === 0) {
    return `组件 "${componentName}" 暂无文档。`;
  }

  return parts.join('\n\n---\n\n');
}

export function registerDocTool(server: McpServer): void {
  server.tool(
    'aura_doc',
    '获取组件的完整文档（API + 示例代码）。优先从 llms-full.txt 读取，回退到源码目录。',
    {
      component: z.string().describe('组件名，例如 button、input、form'),
    },
    async ({ component }) => {
      const name = component.toLowerCase().trim();

      const llmsResult = extractFromLlmsFull(name);
      if (llmsResult) {
        return {
          content: [{ type: 'text' as const, text: llmsResult }],
        };
      }

      const result = extractFromSource(name);
      return {
        content: [{ type: 'text' as const, text: result }],
      };
    },
  );
}
