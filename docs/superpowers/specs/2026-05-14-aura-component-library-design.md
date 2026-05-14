# Aura 组件库设计方案

> 日期：2026-05-14
> 状态：已确认，待实施

## Context

Aura（原名 aura-ui）是一个基于 React 18 + TypeScript + dumi 2 + pnpm monorepo 的组件库项目。目前处于早期阶段，仅有 1 个 Button 组件，无设计 Token 系统、无主题切换、无 AI 支持设施。

本方案旨在将组件库正式命名为 "Aura"，创建完整的现代化 UI 组件体系，设计风格与 "Aura"（光环、光晕、气场）名称呼应，并原生支持 AI/Vibe Coding 工作流。

---

## 一、设计决策

| 维度 | 选择 | 理由 |
|------|------|------|
| 视觉风格 | 双模式（亮色柔和 + 暗色光晕） | 兼顾企业友好与视觉表现力 |
| 主色系 | 紫罗兰 (Violet) | 与 "Aura" 名字最贴切，灵性神秘 |
| 组件范围 | 全部 37 个（5 大类） | 覆盖完整组件库需求 |
| CSS 方案 | CSS Variables (Design Tokens) | 运行时主题切换，零额外依赖 |
| API 风格 | Radix/shadcn 组合式 | 现代、灵活、TypeScript 友好 |
| AI 支持 | LLMs.txt + MCP Server + Skill + CLI | 参考 Ant Design，对齐行业标准 |

---

## 二、AI 友好 4 层架构

### Layer 1: LLMs.txt（零集成）

纯文本文档，任何 AI 工具可直接读取。

```
public/
  llms.txt              # 导航索引，列出所有组件和文档链接
  llms-full.txt         # 完整组件文档（中文），含 API + 示例代码
  llms-semantic.md      # 语义化 DOM 结构描述
```

每个组件文档 URL 支持 `.md` 后缀返回纯文本（如 `/components/button.md`）。

AI 工具集成方式（prompt 示例）：
- Cursor / Windsurf：添加到 `.cursor/rules` 或 `.windsurf/rules`
- Claude Code：添加到 CLAUDE.md
- Codex：添加到 AGENTS.md
- Gemini CLI：使用 `--context` 参数

### Layer 2: MCP Server（IDE 集成）

通过 `@aura/cli` 的 `aura mcp` 命令启动 MCP Server。

**7 个 Tools：**

| Tool | 功能 |
|------|------|
| `aura_list` | 列出所有可用组件 |
| `aura_info` | 获取组件属性规格（TypeScript 类型定义） |
| `aura_doc` | 获取完整组件文档 |
| `aura_demo` | 获取可运行的代码示例 |
| `aura_token` | 查询 Design Token 值和用法 |
| `aura_semantic` | 查看 DOM 结构和样式钩子 |
| `aura_changelog` | API 变更分析 |

**2 个 Prompts：**

| Prompt | 功能 |
|--------|------|
| `aura-expert` | 定位为 Aura 组件库专家角色 |
| `aura-page-generator` | 基于组件库生成页面 |

配置示例：
```json
{
  "mcpServers": {
    "aura": {
      "command": "aura",
      "args": ["mcp"]
    }
  }
}
```

### Layer 3: Skill（AI IDE 深度集成）

`@aura/skill` 提供预置的 Agent 技能文件。

**包含 Skills：**

| Skill | 用途 |
|-------|------|
| `component-guide` | 根据场景推荐组件选型 |
| `theme-customize` | Design Token 定制指南 |
| `page-generator` | 常见页面布局模板生成 |
| `best-practices` | 最佳实践代码片段 |

安装方式：
```bash
npm i -g @aura/skill
npx aura-skill
```

支持 Claude Code（Plugin Marketplace）、Cursor、Codex 一键安装。

### Layer 4: CLI（命令行工具）

`@aura/cli` 提供命令行工具集。

```bash
aura mcp              # 启动 MCP Server
aura skill            # 安装 Skill 到当前 IDE
aura doc <component>  # 快速查看组件文档
aura init             # 初始化 Aura UI 项目
```

---

## 三、项目架构

```
packages/
├── shared/              # @aura/shared
│   └── src/
│       ├── tokens.ts    # Design Token 定义（颜色/圆角/阴影/间距/字号）
│       ├── utils.ts     # 工具函数（classNames, debounce, throttle 等）
│       └── index.ts
│
├── ui/                  # @aura/ui
│   └── src/
│       ├── index.ts     # 统一导出
│       ├── theme/
│       │   ├── tokens.css       # CSS 变量（亮色 + 暗色）
│       │   ├── ThemeProvider.tsx # 主题切换 Provider（可选）
│       │   └── useTheme.ts      # 主题 hook
│       ├── button/
│       │   ├── index.tsx
│       │   ├── index.less
│       │   └── demo/
│       ├── input/
│       ├── card/
│       │   ├── index.tsx        # Card + Card.Header + Card.Body + Card.Footer
│       │   └── index.less
│       └── ...（其他组件）
│
├── request/             # @aura/request（保持不变）
│
├── cli/                 # @aura/cli（新增）
│   └── src/
│       ├── index.ts     # CLI 入口（commander）
│       ├── mcp.ts       # MCP Server 实现（@modelcontextprotocol/sdk）
│       └── commands/    # 子命令
│
└── skill/               # @aura/skill（新增）
    ├── package.json
    └── skills/
        ├── component-guide.md
        ├── theme-customize.md
        ├── page-generator.md
        └── best-practices.md

docs/                    # dumi 文档源文件
public/                  # 静态文件（构建后）
  ├── llms.txt
  ├── llms-full.txt
  └── llms-semantic.md
```

---

## 四、Design Tokens 体系

### Token 层级

```
颜色:
  --aura-primary-{50..950}       # 紫罗兰 10 级色阶
  --aura-gray-{50..950}          # 中性灰 10 级色阶
  --aura-success / warning / error / info   # 语义色
  --aura-bg / --aura-bg-secondary           # 背景色
  --aura-text / --aura-text-secondary       # 文字色
  --aura-border                              # 边框色

间距: --aura-spacing-{1..12}     # 4px 基数（4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48）
圆角: --aura-radius-{sm:6px | md:10px | lg:14px | xl:20px | full:9999px}
阴影:
  --aura-shadow-sm              # 微阴影
  --aura-shadow-md              # 标准阴影
  --aura-shadow-lg              # 大阴影
  --aura-shadow-glow            # 暗色光晕（0 0 20px rgba(124,58,237,0.3)）
字号: --aura-font-size-{xs:12px | sm:13px | md:14px | lg:16px | xl:18px | 2xl:20px | 3xl:24px}
动画:
  --aura-duration-fast: 150ms
  --aura-duration-normal: 200ms
  --aura-duration-slow: 300ms
  --aura-easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 双模式主题

**亮色模式（`data-theme="light"` 或默认）：**
- 背景：白色 / 浅灰
- 主色：`#7c3aed`（紫罗兰）
- 阴影：柔和 box-shadow
- Focus：紫色 ring

**暗色模式（`data-theme="dark"`）：**
- 背景：`#0f0c29`（深蓝紫）
- 主色：`#a78bfa`（浅紫）
- 阴影：光晕效果 `box-shadow: 0 0 20px rgba(124,58,237,0.3)`
- Focus：紫色光晕

### ThemeProvider

```tsx
// 可选使用 — 不包 Provider 也有默认主题
import { ThemeProvider } from '@aura/ui';

<ThemeProvider theme="dark">
  <App />
</ThemeProvider>

// 或 hook 控制
const { theme, toggleTheme } = useTheme();
```

---

## 五、组件 API 设计规范

### 统一 Props 约定

```typescript
// 所有组件共享
interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// 交互组件额外
interface InteractiveProps extends BaseProps {
  disabled?: boolean;
  loading?: boolean;
}

// 尺寸 — 统一三档
size?: 'sm' | 'md' | 'lg'

// 变体 — 各组件自定义
variant?: string  // 如 'default' | 'primary' | 'dashed' | 'text' | 'link'
```

### AI 友好原则

1. **零配置可用**：不依赖 Provider 也能渲染，ThemeProvider 可选
2. **直觉命名**：`<Button>` `<Input>` `<Card>` `<Select>` `<Modal>` — 通用名
3. **统一 prop 约定**：`variant` / `size` / `disabled` / `loading` 跨组件一致
4. **字符串优于枚举**：`variant="primary"` 而不是 `variant={ButtonVariant.Primary}`
5. **children 优先**：组件默认接受 children
6. **丰富 JSDoc**：每个 prop 有中文描述和示例
7. **开箱即美**：零 props 即为推荐样式
8. **单一导入**：`import { Button, Card, Input } from '@aura/ui'`
9. **组合式子组件**：`Card.Header` / `Card.Body` / `Card.Footer`

### 示例：Card 组件

```tsx
// Card/index.tsx
export interface CardProps extends BaseProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  // ...
});

// 子组件
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Actions = CardActions;
Card.Footer = CardFooter;
```

### 示例：JSDoc 规范

```typescript
interface ButtonProps extends InteractiveProps {
  /** 按钮变体样式
   *  @default 'default'
   *  @example <Button variant="primary">提交</Button>
   */
  variant?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  /** 按钮尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中，显示旋转图标
   *  @example <Button loading>提交中</Button>
   */
  loading?: boolean;
}
```

---

## 六、37 个组件清单

### 通用基础（6 个）

| 组件 | 说明 | 子组件 |
|------|------|--------|
| Button ✅ | 按钮（需改造） | Button.Icon |
| Typography | 排版文字 | Typography.Title / Typography.Text / Typography.Paragraph |
| Space | 间距 | — |
| Divider | 分割线 | — |
| Layout | 布局容器 | Layout.Header / Layout.Body / Layout.Sider / Layout.Footer |
| ThemeProvider | 主题切换 | — |

### 表单交互（10 个）

| 组件 | 说明 | 子组件 |
|------|------|--------|
| Input | 输入框 | Input.Password / Input.Search / Input.Group |
| Textarea | 多行文本域 | — |
| Select | 选择器 | Select.Option / Select.OptGroup |
| Checkbox | 复选框 | Checkbox.Group |
| Radio | 单选框 | Radio.Group |
| Switch | 开关 | — |
| Slider | 滑动条 | — |
| Rate | 评分 | — |
| Upload | 上传 | Upload.Dragger |
| Form | 表单 | Form.Item |

### 反馈提示（6 个）

| 组件 | 说明 | 子组件 |
|------|------|--------|
| Alert | 警告提示 | Alert.Title / Alert.Description |
| Message | 全局消息 | — (静态方法调用) |
| Notification | 通知提醒 | — (静态方法调用) |
| Popconfirm | 确认气泡 | — |
| Result | 结果页 | Result.Icon / Result.Title / Result.Subtitle / Result.Actions |
| Spin | 加载中 | — |

### 数据展示（8 个）

| 组件 | 说明 | 子组件 |
|------|------|--------|
| Tag | 标签 | Tag.Group / Tag.Checkable |
| Badge | 徽标 | — |
| Avatar | 头像 | Avatar.Group |
| Tooltip | 文字提示 | — |
| Card | 卡片 | Card.Header / Card.Title / Card.Body / Card.Actions / Card.Footer / Card.Cover |
| Collapse | 折叠面板 | Collapse.Item |
| Tabs | 标签页 | Tabs.Tab |
| Empty | 空状态 | Empty.Preset |

### 导航布局（7 个）

| 组件 | 说明 | 子组件 |
|------|------|--------|
| Menu | 菜单 | Menu.Item / Menu.SubMenu / Menu.Group |
| Breadcrumb | 面包屑 | Breadcrumb.Item |
| Pagination | 分页 | — |
| Steps | 步骤条 | Steps.Step |
| Dropdown | 下拉菜单 | — |
| Flex | 弹性布局 | — |
| Scrollbar | 滚动条 | — |

---

## 七、视觉规范

### 通用规则

- **圆角**：`--aura-radius-md`（10px），所有组件统一
- **过渡**：`all var(--aura-duration-normal) var(--aura-easing)`，hover/focus 柔和变化
- **Focus**：亮色用紫色 ring，暗色用紫色光晕
- **暗色特色**：交互元素聚焦时边缘出现淡紫色光晕（`--aura-shadow-glow`）
- **命名**：BEM 风格，`aura-btn`、`aura-btn-primary`、`aura-card-header`
- **无障碍**：所有交互组件支持 `aria-*` 属性和键盘操作

### 暗色模式光晕效果规则

- 输入框聚焦：`box-shadow: 0 0 0 2px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.15)`
- 按钮悬浮：`box-shadow: 0 0 15px rgba(124,58,237,0.2)`
- 卡片悬浮：`box-shadow: 0 0 25px rgba(124,58,237,0.15)`
- 开关激活：`box-shadow: 0 0 12px rgba(124,58,237,0.3)`

---

## 八、实施分批

### 第一批：核心基础 + 主题系统

ThemeProvider · tokens.css · Button 改造 · Typography · Space · Divider · Input · Textarea · Select · Checkbox · Radio · Switch · Alert · Spin

### 第二批：数据展示 + 反馈

Tag · Badge · Avatar · Card · Tooltip · Collapse · Tabs · Empty · Message · Notification

### 第三批：导航 + 高级表单

Menu · Breadcrumb · Pagination · Steps · Dropdown · Slider · Rate · Upload · Form · Result · Popconfirm · Layout · Flex · Scrollbar

### 第四批：AI 支持设施

@aura/cli · MCP Server · LLMs.txt 生成 · @aura/skill

---

## 九、验证方式

1. **组件验证**：每个组件在 dumi 文档站中可交互查看，含亮/暗模式切换
2. **类型验证**：所有组件通过 TypeScript 严格模式编译
3. **AI 支持验证**：
   - LLMs.txt：用 curl 验证各文件可访问
   - MCP Server：在 Claude Code 中配置并调用 `aura_list` 等工具
   - Skill：在 Claude Code 中安装并触发 component-guide skill
   - CLI：`aura mcp`、`aura skill`、`aura doc button` 命令可用
4. **主题切换**：通过 ThemeProvider 在亮/暗模式间切换，所有组件样式正确响应
