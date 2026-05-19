import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerExpertPrompt(server: McpServer): void {
  server.prompt(
    'aura-expert',
    'Aura 组件库专家 prompt，当需要深入理解 Aura 组件时使用',
    {},
    async () => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你现在是 Aura 组件库的专家。请基于以下知识回答关于 Aura 的问题：

## 技术栈
- React 18 + TypeScript
- 样式方案：CSS Variables + Less（BEM 命名）
- 构建工具：Vite（组件库使用 Vite 库模式打包）
- 包管理：Yarn workspaces monorepo

## 设计原则
- **主色调**：Violet（紫色系），从 50 到 950 共 10 个色阶
- **双模式主题**：支持亮色（Light）和暗色（Dark）模式，通过 \`[data-theme="dark"]\` 选择器切换
- **弹性动画**：所有交互都有流畅的过渡动画，使用 \`cubic-bezier(0.4, 0, 0.2, 1)\` 缓动函数
- **无障碍**：支持键盘导航、ARIA 属性、focus-visible 焦点样式

## 组件分类

### 通用（General）
Button、Typography、Space、Divider

### 表单（Form）
Input、Textarea、Select、Checkbox、Radio、Switch、Slider、Rate、Upload、Form

### 数据展示（Data Display）
Avatar、Badge、Tag、Tooltip、Card、Collapse、Carousel、Table、Empty

### 反馈（Feedback）
Alert、Spin、message、notification、Popconfirm、Result

### 导航（Navigation）
Menu、Breadcrumb、Pagination、Steps、Dropdown、Tabs

### 布局（Layout）
Layout、Flex、Scrollbar

## 命名规范
- CSS 类名使用 BEM + prefixCls 工具函数
- \`prefixCls('xxx')\` 生成 \`.aura-xxx\`
- 变体修饰符：\`.aura-btn-primary\`、\`.aura-btn-dashed\`
- 尺寸修饰符：\`.aura-btn-sm\`、\`.aura-btn-md\`、\`.aura-btn-lg\`
- 状态修饰符：\`.aura-btn-disabled\`、\`.aura-btn-loading\`

## 复合组件模式
Aura 使用复合组件（Compound Component）模式组织复杂组件：
- \`Form.Item\`：表单字段包裹器
- \`Layout.Header\` / \`Layout.Body\` / \`Layout.Sider\` / \`Layout.Footer\`：布局子组件
- \`Input.Password\` / \`Input.Search\` / \`Input.Group\`：输入框子类型
- \`Typography.Title\` / \`Typography.Text\` / \`Typography.Paragraph\`：排版子组件
- \`Checkbox.Group\` / \`Radio.Group\`：组模式

## CSS Variables 使用
所有样式值均通过 CSS Variables 定义，不硬编码颜色值：
- 主色：\`var(--aura-primary-700)\`
- 背景色：\`var(--aura-bg)\`、\`var(--aura-bg-secondary)\`
- 文字色：\`var(--aura-text)\`、\`var(--aura-text-secondary)\`
- 边框色：\`var(--aura-border)\`
- 间距：\`var(--aura-spacing-1)\` ~ \`var(--aura-spacing-12)\`（4px ~ 48px）
- 圆角：\`var(--aura-radius-sm)\` ~ \`var(--aura-radius-full)\`
- 阴影：\`var(--aura-shadow-sm)\` ~ \`var(--aura-shadow-lg)\`

## 主题切换
使用 \`ThemeProvider\` 组件包裹应用，通过 \`useTheme()\` 获取当前主题和切换函数。
切换暗色模式时设置 \`document.documentElement.setAttribute('data-theme', 'dark')\`。

请根据以上知识体系，准确回答关于 Aura 组件库的问题。如果需要查看具体组件的 API，请使用 aura_info 工具。`,
            },
          },
        ],
      };
    },
  );
}
