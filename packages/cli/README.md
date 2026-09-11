# @aura/cli

Aura UI 命令行工具：提供 MCP Server、Skill 安装与文档查询能力，供 AI IDE / 编辑器调用。

> 本包为内部工具，当前标记 `private: true`，尚未发布到 npm。

## 本地使用

```bash
# 构建
pnpm -C packages/cli build

# 运行
node packages/cli/dist/index.js --help
```

构建产物通过 `bin` 暴露为 `aura`：

```json
{ "bin": { "aura": "./dist/index.js" } }
```

## 能力

| 命令 / 模块 | 说明 |
| --- | --- |
| MCP Server | 以 MCP 协议向 AI IDE 暴露 Aura 组件库的元数据 |
| `token` 工具 | 读取并解析 `@aura/ui` 的主题令牌（`tokens.css`） |
| `doc` | 查询组件文档 |
| `skill` | 安装 / 管理 Aura Skill 文件 |

`token` 工具当前从 `packages/ui/src/theme/tokens.css` 读取令牌，因此运行环境需能访问**仓库源码**，而非已发布的 `esm/` 产物。

## 依赖

| 依赖 | 用途 |
| --- | --- |
| `@modelcontextprotocol/sdk` | MCP 协议实现 |
| `commander` | 命令行参数解析 |
| `zod` | 参数校验 |

## 许可证

MIT
