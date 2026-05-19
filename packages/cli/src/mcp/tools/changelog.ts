import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取最近的 git changelog
 */
function getRecentChangelog(): string {
  try {
    const rootDir = resolveProjectRoot();
    const output = execSync('git log --oneline -20', {
      cwd: rootDir,
      encoding: 'utf-8',
      timeout: 5000,
    });

    return `# Aura 最近变更记录\n\n${output.trim()}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `获取 changelog 失败：${message}`;
  }
}

/**
 * 解析项目根目录
 * 编译后 __dirname 为 packages/cli/dist/mcp/tools
 * 向上 4 级到达项目根目录
 */
function resolveProjectRoot(): string {
  return path.resolve(__dirname, '../../../../');
}

export function registerChangelogTool(server: McpServer): void {
  server.tool('aura_changelog', '获取最近 20 条 changelog', {}, async () => {
    const result = getRecentChangelog();
    return {
      content: [{ type: 'text', text: result }],
    };
  });
}
