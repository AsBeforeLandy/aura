import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerListTool } from './tools/list.js';
import { registerInfoTool } from './tools/info.js';
import { registerDocTool } from './tools/doc.js';
import { registerDemoTool } from './tools/demo.js';
import { registerTokenTool } from './tools/token.js';
import { registerSemanticTool } from './tools/semantic.js';
import { registerChangelogTool } from './tools/changelog.js';
import { registerLlmsTool } from './tools/llms.js';
import { registerExpertPrompt } from './prompts/expert.js';
import { registerGeneratorPrompt } from './prompts/generator.js';

function createServer(): McpServer {
  const server = new McpServer({
    name: 'aura-ui',
    version: '0.0.1',
  });

  // 文档工具（优先使用 llms.txt 系列文档）
  registerLlmsTool(server);
  registerListTool(server);
  registerInfoTool(server);
  registerDocTool(server);
  registerDemoTool(server);
  registerSemanticTool(server);
  registerTokenTool(server);
  registerChangelogTool(server);

  // Prompts
  registerExpertPrompt(server);
  registerGeneratorPrompt(server);

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
