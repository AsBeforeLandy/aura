import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { getWorkspacePath } from '../../utils/paths.js';

/**
 * 获取组件的示例代码
 */
function getComponentDemo(componentName: string): string {
  const uiSourceDir = getWorkspacePath('packages/ui/src');
  const demoPath = path.join(uiSourceDir, componentName, 'demo', 'basic.tsx');

  if (!fs.existsSync(demoPath)) {
    return `错误：未找到组件 "${componentName}" 的示例文件。\n路径：${demoPath}`;
  }

  return fs.readFileSync(demoPath, 'utf-8');
}

export function registerDemoTool(server: McpServer): void {
  server.tool(
    'aura_demo',
    '获取组件的示例代码（demo/basic.tsx）',
    {
      component: z.string().describe('组件名，例如 button、input、form'),
    },
    async ({ component }) => {
      const name = component.toLowerCase().trim();
      const result = getComponentDemo(name);
      return {
        content: [{ type: 'text', text: result }],
      };
    },
  );
}
