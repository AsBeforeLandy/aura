# Aura 组件库 — Plan 5: AI 支持设施

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 AI 友好 4 层架构 — LLMs.txt 文档生成、MCP Server、Skill 文件、CLI 工具。

**Architecture:** CLI 基于 commander.js 构建，MCP Server 使用 @modelcontextprotocol/sdk，Skill 为 Markdown 文件可直接被 Claude Code / Cursor 等 AI IDE 加载，LLMs.txt 为纯文本文件随文档站构建生成。

**Tech Stack:** Node.js + TypeScript + commander.js + @modelcontextprotocol/sdk

**Depends on:** Plan 1 + Plan 2 + Plan 3 + Plan 4（所有组件完成后才能生成完整文档）

---

## File Structure

```
packages/cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # CLI 入口
│   ├── mcp/
│   │   ├── server.ts         # MCP Server 主逻辑
│   │   ├── tools/
│   │   │   ├── list.ts       # aura_list
│   │   │   ├── info.ts       # aura_info
│   │   │   ├── doc.ts        # aura_doc
│   │   │   ├── demo.ts       # aura_demo
│   │   │   ├── token.ts      # aura_token
│   │   │   ├── semantic.ts   # aura_semantic
│   │   │   └── changelog.ts  # aura_changelog
│   │   └── prompts/
│   │       ├── expert.ts     # aura-expert prompt
│   │       └── generator.ts  # aura-page-generator prompt
│   └── commands/
│       ├── mcp.ts            # aura mcp 命令
│       ├── skill.ts          # aura skill 命令
│       └── doc.ts            # aura doc 命令
│
packages/skill/
├── package.json
└── skills/
    ├── component-guide.md
    ├── theme-customize.md
    ├── page-generator.md
    └── best-practices.md

public/                        # dumi public 目录
├── llms.txt
├── llms-full.txt
└── llms-semantic.md
```

---

## Task 1: 创建 @aura/cli 包骨架

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "@aura/cli",
  "version": "0.0.1",
  "description": "Aura UI CLI - MCP Server, Skill installation, and documentation tools",
  "bin": {
    "aura": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "commander": "^13.1.0"
  },
  "devDependencies": {
    "typescript": "^6.0.3",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 2: 创建 CLI 入口**

Create: `packages/cli/src/index.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('aura')
  .description('Aura UI CLI — AI-friendly component library tools')
  .version('0.0.1');

program
  .command('mcp')
  .description('Start MCP Server for AI IDE integration')
  .action(async () => {
    const { startMcpServer } = await import('./mcp/server');
    await startMcpServer();
  });

program
  .command('skill')
  .description('Install Aura skills to current IDE')
  .action(async () => {
    const { installSkill } = await import('./commands/skill');
    await installSkill();
  });

program
  .command('doc')
  .description('Show component documentation')
  .argument('<component>', 'Component name')
  .action(async (component: string) => {
    const { showDoc } = await import('./commands/doc');
    await showDoc(component);
  });

program.parse();
```

- [ ] **Step 3: 安装依赖**

```bash
cd /Users/landy/GitHub-program/aura
pnpm install
```

- [ ] **Step 4: 提交**

```bash
git add packages/cli/
git commit -m "feat(cli): add @aura/cli package skeleton"
```

---

## Task 2: MCP Server 实现

**Files:**
- Create: `packages/cli/src/mcp/server.ts`
- Create: `packages/cli/src/mcp/tools/list.ts`
- Create: `packages/cli/src/mcp/tools/info.ts`
- Create: `packages/cli/src/mcp/tools/doc.ts`
- Create: `packages/cli/src/mcp/tools/demo.ts`
- Create: `packages/cli/src/mcp/tools/token.ts`
- Create: `packages/cli/src/mcp/tools/semantic.ts`
- Create: `packages/cli/src/mcp/tools/changelog.ts`
- Create: `packages/cli/src/mcp/prompts/expert.ts`
- Create: `packages/cli/src/mcp/prompts/generator.ts`

**MCP Server 核心逻辑:**

```typescript
// server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerListTool } from './tools/list';
import { registerInfoTool } from './tools/info';
import { registerDocTool } from './tools/doc';
import { registerDemoTool } from './tools/demo';
import { registerTokenTool } from './tools/token';
import { registerSemanticTool } from './tools/semantic';
import { registerChangelogTool } from './tools/changelog';
import { registerExpertPrompt } from './prompts/expert';
import { registerGeneratorPrompt } from './prompts/generator';

export async function startMcpServer() {
  const server = new McpServer({
    name: 'aura',
    version: '0.0.1',
  });

  registerListTool(server);
  registerInfoTool(server);
  registerDocTool(server);
  registerDemoTool(server);
  registerTokenTool(server);
  registerSemanticTool(server);
  registerChangelogTool(server);
  registerExpertPrompt(server);
  registerGeneratorPrompt(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Aura MCP Server running on stdio');
}
```

每个 tool 从组件源码和文档中读取数据并返回给 AI。数据源路径基于 `__dirname` 相对定位到 `packages/ui/src/`。

---

## Task 3: Skill 文件创建

**Files:**
- Create: `packages/skill/package.json`
- Create: `packages/skill/skills/component-guide.md`
- Create: `packages/skill/skills/theme-customize.md`
- Create: `packages/skill/skills/page-generator.md`
- Create: `packages/skill/skills/best-practices.md`

**component-guide.md 内容大纲:**
- 根据用户场景（表单、数据展示、导航、反馈）推荐 Aura 组件
- 列出每个组件的 variant / size / 核心用法
- 包含 copy-paste 代码片段

**theme-customize.md 内容大纲:**
- Design Token 体系说明
- 如何通过 CSS Variables 覆盖默认值
- 亮/暗模式自定义指南

**page-generator.md 内容大纲:**
- 常见页面模板（登录页、仪表盘、列表页、详情页）
- 每个模板使用哪些 Aura 组件
- 完整代码示例

**best-practices.md 内容大纲:**
- 组件选择最佳实践
- 可访问性规范
- 性能优化建议
- 与 AI 工具配合的最佳工作流

---

## Task 4: LLMs.txt 生成

**Files:**
- Create: `public/llms.txt`
- Create: `public/llms-full.txt`
- Create: `public/llms-semantic.md`
- Create: `scripts/generate-llms.ts`（自动从组件源码生成）

**llms.txt 格式（参考 antd）:**
```
# Aura UI — AI 友好的 React 组件库

> 基于 React 18 + TypeScript + CSS Variables，支持亮/暗双模式主题

## 快速开始
npm install @aura/ui

## 组件列表
- Button: 按钮组件 (variant: default/primary/dashed/text/link, size: sm/md/lg)
- Input: 输入框 (variant: default/filled/bordered, size: sm/md/lg)
...

## 文档链接
- 完整文档: /llms-full.txt
- 语义化结构: /llms-semantic.md
```

**llms-full.txt:** 每个组件的完整 API 文档 + 代码示例，纯文本格式。

**llms-semantic.md:** 每个组件的 DOM 结构和 CSS 类名描述。

---

## Task 5: CLI 命令实现

**Files:**
- Create: `packages/cli/src/commands/skill.ts`
- Create: `packages/cli/src/commands/doc.ts`

**skill.ts:** 检测当前 IDE 类型（Claude Code / Cursor / Codex），将 skill 文件复制到对应目录。

**doc.ts:** 从组件源码中读取组件文档并在终端显示。

---

## Task 6: 集成测试

- [ ] MCP Server 启动验证：`npx aura mcp` 能启动并响应 tool 调用
- [ ] LLMs.txt 文件验证：curl 确认可访问
- [ ] Skill 安装验证：在 Claude Code 中配置并触发
- [ ] CLI 命令验证：`aura doc button` 输出正确
- [ ] 最终提交

---

## Self-Review

**Spec coverage:**
- ✅ Layer 1 LLMs.txt — Task 4
- ✅ Layer 2 MCP Server (7 tools + 2 prompts) — Task 2
- ✅ Layer 3 Skill — Task 3
- ✅ Layer 4 CLI — Task 1, 5

**Placeholder scan:** 无 TBD/TODO
**Type consistency:** MCP tool 名称与 spec 一致（aura_list, aura_info 等）
