# @aura-react-comp/x

Aura AI 组件库：对话式 AI 界面的原子组件与数据流 Hooks，对标 Ant Design X 的 Aura 实现。

覆盖从「输入 → 流式接收 → 渲染 → 推理过程 → 消息操作 → 会话管理」的完整链路，
并以 `XProvider` 与 Aura 生态共享同一套紫罗兰视觉语言。

## 安装

```bash
pnpm add @aura-react-comp/x antd react react-dom
```

`antd`（>=6）、`react` / `react-dom`（>=18）为 peerDependencies，需由使用方提供。
`mermaid`（>=10）为**可选** peerDependency，仅在使用 `Mermaid` 组件时才需要安装。

## 样式引入（重要）

```tsx
import '@aura-react-comp/ui/style.css'; // Aura 基础设计令牌（--aura-*）
import '@aura-react-comp/x/style.css'; // AI 组件样式
```

本包的 `.less` 直接使用 `var(--aura-*)` 且**不设 fallback**，基础令牌未加载时
颜色、圆角、字号、间距会整体失效。基础令牌由 `@aura-react-comp/ui` 提供，
因此无论是否使用 `@aura-react-comp/ui` 的组件，都需引入它的 `style.css` 一次。

品牌相关变量（渐变 / 光晕 / 软底色，`--aura-x-*`）由 `XProvider` 在运行期
从 `colorPrimary` 实时派生并注入子树作用域——**换主色即时全量生效**，无需重新构建样式。

## 使用

```tsx
import { XProvider, Bubble, Sender, useXChat } from '@aura-react-comp/x';
import '@aura-react-comp/ui/style.css';
import '@aura-react-comp/x/style.css';

const App = () => {
  const { messages, onRequest } = useXChat({ request: callModel });

  return (
    <XProvider>
      <Bubble.List items={messages} />
      <Sender onSubmit={({ message }) => onRequest({ message })} />
    </XProvider>
  );
};
```

建议在应用根节点包裹 `XProvider`，使 antd 主题与 Aura 品牌色（默认主色 `#7c3aed`）保持一致。

## 组件总览（20 个导出）

| 分组     | 组件                                | 说明                                                               |
| -------- | ----------------------------------- | ------------------------------------------------------------------ |
| 主题桥接 | `XProvider`                         | 将 Aura 设计令牌映射到 antd 主题系统，支持暗色 / 紧凑 / 自定义主色 |
| 交互     | `Bubble` / `Bubble.List`            | 消息气泡，支持头像、加载态、变体与列表分组                         |
| 交互     | `Sender`                            | 对话输入框，支持提交类型、加载态与自定义操作区                     |
| 交互     | `Attachments`                       | 附件条，支持上传、预览与状态展示                                   |
| 交互     | `FileCard`                          | 文件卡片，内置状态与文件大小 / 扩展名格式化                        |
| 交互     | `Folder`                            | 文件树，支持预览、右键菜单与自定义目录图标                         |
| 引导     | `Welcome`                           | 欢迎语，用于对话开始的引导区                                       |
| 引导     | `Prompts`                           | 提示集，支持横向 / 纵向排布                                        |
| 引导     | `Suggestion`                        | 建议项，用于输入框上方的快捷提问                                   |
| 推理     | `Think`                             | 单段思考过程展示                                                   |
| 推理     | `ThoughtChain`                      | 多步思维链，支持状态与嵌套内容                                     |
| 反馈     | `Actions`                           | 消息操作组（复制 / 重试 / 点赞等）                                 |
| 反馈     | `MarkdownContent`                   | Markdown 安全渲染，围栏代码块默认接入语法高亮                      |
| 反馈     | `Sources`                           | 来源引用与跳转                                                     |
| 反馈     | `CodeHighlighter`                   | 代码高亮，配色走 `var(--aura-*)` 以自动跟随亮暗主题                |
| 反馈     | `Mermaid`                           | Mermaid 图表渲染（`mermaid` 为可选依赖，按需动态加载）             |
| 会话     | `Conversations`                     | 会话列表管理，支持分组与菜单                                       |
| 数据     | `useXStream`                        | SSE / 流式响应解析                                                 |
| 数据     | `useXChat`                          | 对话数据流管理，支持多会话与请求中止                               |
| 数据     | `XNotification` / `useNotification` | 系统级通知与权限管控                                               |

完整 API 与在线示例见文档站「AI 组件」。

## 许可证

MIT
