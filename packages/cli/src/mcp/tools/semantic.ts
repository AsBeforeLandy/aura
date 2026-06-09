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
 * 从 llms-semantic.md 中提取指定组件的 DOM 结构
 */
function extractFromLlmsSemantic(componentName: string): string | null {
  const filePath = path.join(getPublicDir(), 'llms-semantic.md');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  const nameCap = componentName.charAt(0).toUpperCase() + componentName.slice(1);

  const regex = new RegExp(
    `## ${nameCap}[\\s\\S]*?(?=\\n## [A-Z]|$)`,
    'm',
  );
  const match = content.match(regex);
  return match ? match[0].trim() : null;
}

/**
 * CSS 类名语义化描述映射（fallback）
 */
const CLASS_SEMANTIC_MAP: Record<string, string> = {
  '-disabled': '禁用状态',
  '-loading': '加载状态',
  '-active': '激活状态',
  '-checked': '选中状态',
  '-selected': '选中状态',
  '-visible': '可见状态',
  '-sm': '小尺寸',
  '-md': '中尺寸',
  '-lg': '大尺寸',
  '-primary': '主要样式',
  '-default': '默认样式',
  '-dashed': '虚线样式',
  '-error': '错误状态',
  '-warning': '警告状态',
  '-success': '成功状态',
};

function extractFromLess(componentName: string): string {
  const lessPath = path.join(getUiSourceDir(), componentName, 'index.less');
  if (!fs.existsSync(lessPath)) {
    return `错误：未找到组件 "${componentName}" 的样式文件。`;
  }

  const content = fs.readFileSync(lessPath, 'utf-8');
  const classRegex = /\.aura-([a-zA-Z0-9_-]+)/g;
  const classNames = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = classRegex.exec(content)) !== null) {
    classNames.add(match[1]);
  }

  if (classNames.size === 0) {
    return `组件 "${componentName}" 的样式文件中未找到 .aura- 开头的类名。`;
  }

  const lines: string[] = [];
  for (const cls of classNames) {
    const line = `.aura-${cls}`;
    let desc = '';
    for (const [suffix, d] of Object.entries(CLASS_SEMANTIC_MAP)) {
      if (cls.endsWith(suffix)) { desc = d; break; }
    }
    lines.push(desc ? `  ${line} — ${desc}` : `  ${line}`);
  }

  return `# ${componentName} 组件 CSS 类名结构\n\n共 ${classNames.size} 个类名\n\n${lines.join('\n')}`;
}

export function registerSemanticTool(server: McpServer): void {
  server.tool(
    'aura_semantic',
    '获取组件的 CSS 类名结构和 DOM 结构。优先从 llms-semantic.md 读取，回退到 Less 源码提取。',
    {
      component: z.string().describe('组件名，例如 button、input、form'),
    },
    async ({ component }) => {
      const name = component.toLowerCase().trim();

      // 优先使用 llms-semantic.md
      const llmsResult = extractFromLlmsSemantic(name);
      if (llmsResult) {
        return {
          content: [{ type: 'text' as const, text: llmsResult }],
        };
      }

      // fallback 到 Less 源码
      const result = extractFromLess(name);
      return {
        content: [{ type: 'text' as const, text: result }],
      };
    },
  );
}
