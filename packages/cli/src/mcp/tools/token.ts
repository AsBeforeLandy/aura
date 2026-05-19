import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取 Design Token 列表（只输出 :root 下的亮色值）
 */
function getDesignTokens(): string {
  const uiSourceDir = path.resolve(__dirname, '../../ui/src');
  const tokenPath = path.join(uiSourceDir, 'theme', 'tokens.css');

  if (!fs.existsSync(tokenPath)) {
    return '错误：未找到 tokens.css 文件。';
  }

  const content = fs.readFileSync(tokenPath, 'utf-8');

  // 提取 :root { ... } 块
  const rootMatch = content.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) {
    return '错误：tokens.css 中未找到 :root 块。';
  }

  const rootBlock = rootMatch[1];

  // 解析所有 CSS 变量，按注释分组
  const tokens: { name: string; value: string; comment?: string }[] = [];
  const lines = rootBlock.split('\n');
  let currentComment = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // 提取注释
    const commentMatch = trimmed.match(/\/\*\s*(.+?)\s*\*\//);
    if (commentMatch && !trimmed.includes('--')) {
      currentComment = commentMatch[1];
      continue;
    }

    // 提取 CSS 变量
    const varMatch = trimmed.match(/(--aura-[a-zA-Z0-9-]+)\s*:\s*(.+?)\s*;/);
    if (varMatch) {
      tokens.push({
        name: varMatch[1],
        value: varMatch[2],
        comment: currentComment || undefined,
      });
      currentComment = '';
    }
  }

  // 按类别分组输出
  const groups: Record<string, { name: string; value: string }[]> = {};
  let currentGroup = 'General';

  for (const token of tokens) {
    if (token.comment) {
      currentGroup = token.comment;
    }
    if (!groups[currentGroup]) {
      groups[currentGroup] = [];
    }
    groups[currentGroup].push({ name: token.name, value: token.value });
  }

  const output = Object.entries(groups)
    .map(([group, vars]) => {
      const varLines = vars.map((v) => `  ${v.name}: ${v.value}`).join('\n');
      return `### ${group}\n${varLines}`;
    })
    .join('\n\n');

  return `# Aura Design Tokens（亮色模式）\n\n共 ${tokens.length} 个变量\n\n${output}`;
}

export function registerTokenTool(server: McpServer): void {
  server.tool('aura_token', '获取 Design Token 列表（CSS Variables）', {}, async () => {
    const result = getDesignTokens();
    return {
      content: [{ type: 'text', text: result }],
    };
  });
}
