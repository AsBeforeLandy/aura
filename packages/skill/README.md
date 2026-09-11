# @aura/skill

Aura UI 的 AI Skill 提示词资产。

> **这不是代码包。** 本目录不产出构建产物，仅包含交付给 AI IDE 的 Markdown 提示词文件，因此标记 `private: true`，不参与发布。

## 内容

```
skills/
├── best-practices.md      # Aura 组件库使用最佳实践
├── component-guide.md     # 组件选型与 API 速查
├── page-generator.md      # 基于 Aura 生成中后台页面的提示词
└── theme-customize.md     # 主题定制（CSS Variables）指引
```

## 使用

将 `skills/` 下的 Markdown 文件作为上下文提供给 AI 编码助手（或由 `@aura/cli` 的 `skill` 命令安装），即可让助手按 Aura 的组件规范与设计约定生成代码。

## 维护约定

- 文件名使用 kebab-case，内容以「可直接被 AI 消费」为目标：明确的组件名、属性名与代码片段。
- 组件 API 变更时需同步更新 `component-guide.md`，否则助手会生成过时代码。

## 许可证

MIT
