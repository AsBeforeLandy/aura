---
toc: content
---

# AI 智能协同

Aura 是一个`智能时代原生（AI-Native）`的组件库。与传统的仅面向人类开发者的 UI 库不同，Aura 在设计之初就融入了“AI 协同开发”的理念，内置了标准化 MCP 服务、智能提示词（Prompts）以及面向 AI 智能体的 IDE 技能（Skills），让 AI 编码助手（如 Claude Code, Cursor, Windsurf 等）可以秒级定位文档、精准生成符合设计规范的组件代码。

---

## 核心设计

Aura 针对 AI 协同进行了以下多项专项设计：

1. **API 高度内聚**：采用 Compound Component（复合组件）架构，避免“属性地狱”（Props Hell），降低 AI 理解和组装代码的幻觉率。
2. **样式完全语义化**：遵循严格的 BEM 命名规范，状态（如 `-disabled`）、尺寸（如 `-sm`）语义清晰，使 AI 生成样式和调试 CSS 时更有条理。
3. **LLM 专用文档**：打包编译时同步生成 `llms.txt`（精炼概览）、`llms-full.txt`（完整 API 与用例）和 `llms-semantic.md`（DOM 结构和 CSS 类名），便于 LLM 快速上下文注入。

---

## MCP Server

Aura 内置了 **Model Context Protocol (MCP)** 服务，可以将 Aura 的组件文档、示例代码和样式 Token 直接作为“工具”暴露给 AI 助手。

### 1. 启动命令

你可以直接通过 `npx` 启动 MCP 服务（使用 Stdio 标准输入输出传输协议）：

```bash
npx @aura/cli mcp
```

### 2. 在 IDE 中配置

#### Claude Code (CLI)

在终端运行以下命令，将 Aura MCP 服务添加到全局配置中：

```bash
claude mcp add aura-ui npx -- @aura/cli mcp
```

#### Cursor

1. 打开 Cursor 设置：**Settings** -> **Features** -> **MCP**。
2. 点击 **+ Add New MCP Server**。
3. 填入配置：
   - **Name**: `aura-ui`
   - **Type**: `command`
   - **Command**: `npx -y @aura/cli mcp`

#### Windsurf

在全局配置文件（通常位于 `~/.codeium/windsurf/mcp_config.json`）中添加：

```json
{
  "mcpServers": {
    "aura-ui": {
      "command": "npx",
      "args": ["-y", "@aura/cli", "mcp"]
    }
  }
}
```

### 3. MCP 工具与提示词清单

启动后，AI 助手将自动获取以下工具和 Prompt 资源：

| 工具名称        | 功能描述                                             | 参数                            |
| --------------- | ---------------------------------------------------- | ------------------------------- |
| `aura_list`     | 列出组件库中所有的组件名称                           | 无                              |
| `aura_info`     | 获取单个组件的 API 参数接口定义（基于源码 JSDoc）    | `component` (组件名)            |
| `aura_doc`      | 获取组件的完整开发文档（包含详细参数和示例）         | `component` (组件名)            |
| `aura_demo`     | 获取组件的 `basic.tsx` 官方标准演示代码              | `component` (组件名)            |
| `aura_semantic` | 查询组件的 DOM 树嵌套结构和 `.aura-` 前缀的 CSS 类名 | `component` (组件名)            |
| `aura_token`    | 获取组件库当前的 Design Token 变量（CSS 变量）       | 无                              |
| `aura_llms`     | 按不同级别获取 LLMs 专用文本文件（概览/完整/语义）   | `level` (compact/full/semantic) |

| 提示词（Prompt）      | 适用场景                                                       |
| --------------------- | -------------------------------------------------------------- |
| `aura-expert`         | 让 AI 助手化身 Aura 专家，回答关于技术栈和设计原则的深度疑问。 |
| `aura-page-generator` | 引导 AI 助手遵循 Aura 规范生成高质量的完整页面代码。           |

---

## IDE 技能 (Skills)

除了 MCP 动态服务，Aura 还提供了**静态 Skill 规则文件**。这些文件是专为 AI 开发助手编写的 Markdown 指导规范，可存放在 IDE 的固定技能目录中，指导 AI 助手的生成决策。

### 1. 安装技能

如果你的开发环境中安装了 **Claude Code**，可以直接在项目根目录运行以下命令一键安装：

```bash
# 本地 Monorepo 开发环境
node packages/cli/dist/index.js skill

# 外部项目使用时
npx @aura/cli skill
```

这会自动将技能文件复制到你的系统目录 `~/.claude/skills/` 下。

### 2. 技能内容简介

Aura 内置了 4 类核心技能文件，帮助 AI 助手在开发不同环节做出明智选择：

- **`best-practices.md`**：规范 AI 的组件选型逻辑（例如什么时候用 Message 什么时候用 Notification）、无障碍（a11y）指南以及性能优化准则。
- **`component-guide.md`**：提供快速组件 API 速查和受控/非受控模式使用指导，是 AI 编写逻辑时的“金典手册”。
- **`page-generator.md`**：指导 AI 编写页面时的布局结构（如推荐使用 `Flex` 组件、用 `Card` 划分模块），强制使用 `var(--aura-*)` 的 Design Token，严禁硬编码颜色。
- **`theme-customize.md`**：指导 AI 在需要定制主题时如何使用全局或局部的 CSS Variables，不破坏组件库底层的封装。

---

## AI 协同实战示例

配置好 MCP Server 或 Skills 后，你可以直接这样向 AI 提问：

> 💡 **提问示例 1（组件选用）**
>
> _“我需要做一个列表页面里的‘删除’确认。根据 Aura 的最佳实践，我应该用哪个组件？请帮我写出交互代码。”_
>
> _(AI 助手会通过 `best-practices.md` 识别出应使用 `Popconfirm` 气泡确认框，并利用 `aura_demo` 查询其基础用法，给出符合规范的 React 代码。)_

> 💡 **提问示例 2（页面生成）**
>
> _“帮我设计一个包含搜索框、用户卡片列表和底部分页的‘用户中心’页面。”_
>
> _(AI 助手将调起 `aura-page-generator` 提示词，自动使用 `Layout.Body`、`Flex`、`Card`、`Input.Search` 和 `Pagination` 拼装页面，且样式中会自动应用 `var(--aura-spacing-4)`、`var(--aura-bg)` 等 Design Token。)_
