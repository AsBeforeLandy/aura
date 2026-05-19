import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 定位 public/ 目录（编译后在 packages/cli/dist/mcp/tools/）
 */
function getPublicDir(): string {
  return path.resolve(__dirname, '../../../../public');
}

/**
 * 读取 public/ 下的文件
 */
function readPublicFile(filename: string): string | null {
  const filePath = path.join(getPublicDir(), filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

export function registerLlmsTool(server: McpServer): void {
  server.tool(
    'aura_llms',
    '获取 Aura 的 LLMs 文档。level=compact 返回 llms.txt（组件概览），level=full 返回 llms-full.txt（完整 API），level=semantic 返回 llms-semantic.md（DOM 结构和类名）',
    {
      level: z
        .enum(['compact', 'full', 'semantic'])
        .default('compact')
        .describe('文档级别：compact（概览）、full（完整 API）、semantic（DOM 结构）'),
    },
    async ({ level }) => {
      const fileMap: Record<string, string> = {
        compact: 'llms.txt',
        full: 'llms-full.txt',
        semantic: 'llms-semantic.md',
      };

      const filename = fileMap[level];
      const content = readPublicFile(filename);

      if (!content) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `错误：未找到 ${filename} 文件。请先运行文档生成脚本。`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text' as const, text: content }],
      };
    },
  );
}
