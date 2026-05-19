import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPublicDir(): string {
  return path.resolve(__dirname, '../../../../public');
}

function getUiSourceDir(): string {
  return path.resolve(__dirname, '../../ui/src');
}

/**
 * 从 llms-full.txt 中提取指定组件的 API 文档段落
 */
function extractFromLlmsFull(componentName: string): string | null {
  const filePath = path.join(getPublicDir(), 'llms-full.txt');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');

  // 匹配 ## ComponentName 或 ## component-name 开始到下一个 ## 或文件尾
  const nameCap = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  const regex = new RegExp(
    `## ${nameCap}[\\s\\S]*?(?=\\n## [A-Z]|$)`,
    'm',
  );
  const match = content.match(regex);
  return match ? match[0].trim() : null;
}

/**
 * 从组件源码中提取 export interface 块（fallback）
 */
function extractFromSource(componentName: string): string {
  const filePath = path.join(getUiSourceDir(), componentName, 'index.tsx');

  if (!fs.existsSync(filePath)) {
    return `错误：未找到组件 "${componentName}" 的源文件。`;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const interfaces: string[] = [];

  const jsdocRegex =
    /\/\*\*[\s\S]*?\*\/\s*export\s+interface\s+\w+[^{]*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g;
  let match: RegExpExecArray | null;

  while ((match = jsdocRegex.exec(content)) !== null) {
    interfaces.push(match[0].trim());
  }

  if (interfaces.length === 0) {
    const simpleRegex = /export\s+interface\s+(\w+)[^{]*\{[\s\S]*?\n\}/g;
    while ((match = simpleRegex.exec(content)) !== null) {
      interfaces.push(match[0].trim());
    }
  }

  if (interfaces.length === 0) {
    return `组件 "${componentName}" 中未找到 export interface 定义。`;
  }

  return interfaces.join('\n\n');
}

export function registerInfoTool(server: McpServer): void {
  server.tool(
    'aura_info',
    '获取单个组件的 API 文档。优先从 llms-full.txt 读取完整文档，回退到源码 interface 提取。',
    {
      component: z.string().describe('组件名，例如 button、input、form'),
    },
    async ({ component }) => {
      const name = component.toLowerCase().trim();

      // 优先使用 llms-full.txt
      const llmsResult = extractFromLlmsFull(name);
      if (llmsResult) {
        return {
          content: [{ type: 'text' as const, text: llmsResult }],
        };
      }

      // fallback 到源码提取
      const result = extractFromSource(name);
      return {
        content: [{ type: 'text' as const, text: result }],
      };
    },
  );
}
