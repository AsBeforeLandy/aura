---
name: aura-component-dev
description: Aura 组件库本仓库的组件开发规范流程。在 aura 仓库内新建组件、修改或扩展现有组件（packages/ui、packages/business、packages/x）、补组件测试 / 文档 / demo、把组件接入包导出时必须使用。当用户提到"新增 / 实现 / 仿写某组件"、"给某组件加 prop"、"补测试、写文档、加 demo"、"按 Aura 规范"、"通过 pnpm verify"时触发——它把仓库门禁（lint / typecheck / coverage / size / smoke）背后的规范编排成可执行流程，确保新组件代码一次通过验证。
---

# Aura 组件开发规范流程

本 skill 约束在 Aura 仓库内开发组件的方式。目标只有一个：**新组件代码一次通过 `pnpm verify` 全链路门禁**，不需要返工。

条款的完整背景、实测数据与案例在 `docs/guide/standards.md`（编码规范与性能基线）与 `docs/guide/toolchain.md`（工具链与门禁矩阵）。这两份文档是唯一权威，本 skill 不复制其全文，只做流程编排与高频规则速查；如有冲突，以权威文档为准。

## 流程总览

新建组件按 7 步走。每步都标注了硬规则——违反任何一条都会被门禁或评审打回：

1. **定位**：选包 + 选参照组件
2. **脚手架**：组件目录 5 件套
3. **实现**：index.tsx
4. **样式**：index.less
5. **测试**：index.test.tsx
6. **文档**：index.md + demo/
7. **导出与验证**：barrel 导出 + pnpm verify + 提交

写代码前先读 [references/templates.md](references/templates.md)：五个文件的完整骨架都从仓库现有组件（badge / modal-form / bubble）提炼而来，直接复制改造，**不要凭空重写**——凭空写的命名、注释、frontmatter 几乎必然偏离仓库风格。

## Step 1 定位：选包与选参照

| 包               | 定位                         | 依赖约束                                                                                                                                                             | 参照组件                                                                |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `@aura/ui`       | 通用 UI 原子组件             | 只依赖 `@aura/shared`、`@aura/icons`；**不得引入 antd**                                                                                                              | 表单类看 `input`/`select`，反馈类看 `alert`，数据展示类看 `badge`/`tag` |
| `@aura/business` | 基于 antd 二次封装的业务组件 | 可用 antd（peer）+ `@aura/ui` + `@aura/shared`                                                                                                                       | `modal-form`、`search-form`、`pro-table`                                |
| `@aura/x`        | AI 对话场景组件              | 运行时依赖 `@aura/shared`（内容渲染类组件另有 `react-markdown` / `prism-react-renderer`）；antd / mermaid 为 peer，按需引入（参照 `sender` 用 antd 的 Button/Input） | `bubble`、`sender`、`markdown-content`                                  |

规则：

- 动手前**先完整读 1~2 个参照组件的 5 件套**（tsx / less / md / test / demo）。命名、JSDoc 注释、测试断言风格、文档结构全部向它看齐，不发明新风格。
- 组件目录名用 kebab-case；组件名与导出名用 PascalCase。
- 选不准包时问一句：这个组件去掉业务语境还成立吗？成立 → ui；是 antd 组件的固定业务封装 → business；服务于 AI 对话流 → x。

## Step 2 脚手架：组件目录 5 件套

```text
packages/<pkg>/src/<kebab-case-name>/
├── index.tsx        # 组件实现：渲染 + 交互
├── index.less       # 样式，与逻辑分离
├── index.md         # 文档与示例（frontmatter 驱动侧栏自动生成）
├── index.test.tsx   # 测试：与组件同目录
└── demo/            # 示例代码（不参与构建与覆盖率统计）
```

- 复杂组件可加 `utils.ts` 纯函数层：**不得依赖 React**（保证不渲染组件就能单测）；日期、树运算等逻辑抽到这里。目前仅 business 包的复杂组件在用。
- 单文件 `index.tsx` 以 **400 行为软上限**：超出先把纯逻辑抽入 `utils.ts`，再把视觉块拆成子组件文件（参照 `cascader-panel`）。
- demo 目录至少一个 `basic.tsx`。

## Step 3 实现 index.tsx

必须遵守（模板见 references/templates.md）：

- **Props 接口**：`export interface XxxProps`，从组件入口显式导出；每个 prop 写 JSDoc 注释，有默认值的标 `@default 'xxx'`；内部类型不进公开 API。
- **className / style 必须支持**：接收 `className` 与 `style` 并透传到根元素；类名用 `classNames(prefixCls('xxx'), className)` 合并（`prefixCls` / `classNames` 来自 `@aura/shared`）。
- **ref**：ui / business 组件默认 `forwardRef<HTMLElement类型, XxxProps>` 并在定义后设置 `Xxx.displayName = 'Xxx'`（`message`/`notification` 这类静态方法组件除外）；x 包以 `React.FC` 为主，需要 ref 的组件用 forwardRef 并导出 `XxxRef` 类型（参照 `code-highlighter`）。
- **受控 / 非受控双模式**（表单与交互组件）：`value` + `onChange` 受控，`defaultValue` 非受控；内部 `const isControlled = value !== undefined`。受控模式下交互只回调 `onChange`，不自改状态。
- **TypeScript**：禁 `any`——需要宽类型用 `unknown` 并在使用处收窄；`useRef` 写 `useRef<T | null>(null)`（否则 current 只读）；事件处理用具体事件类型，禁止 `any` 一路透传。
- **可访问性**：可交互元素必须有可访问名称（`aria-label` / `aria-labelledby`）与键盘支持（Enter / Space）；只用合法的 aria 组合（如 `aria-selected` 不能挂在 `role="menuitem"` 上，axe 会拦截）；子面板要有确定性 id（如 `subKey`）供 `aria-controls` 与测试定位。
- **性能红线**：拖拽 / 滚动等高频事件必须用 `requestAnimationFrame` 按帧合并，且 pointerup 时补提交最后一帧；渲染路径禁止对大树 `JSON.stringify` / 深比较；列表热路径查找用 `Set`/`Map` 而非 `includes`；下传给子组件的对象 / 回调用 `useMemo` / `useCallback` 保持引用稳定。
- 组件库代码不向控制台输出（`no-console`，warn/error 除外）。

## Step 4 样式 index.less

- **只用设计令牌**：颜色、圆角、间距一律 `var(--aura-*)`；**禁止硬编码色值**（hex / rgb / rgba）、禁止 `!important`、禁止 `color-mix` 临时派生。
- 可用令牌清单看 `packages/ui/src/theme/tokens.css`（单一事实来源）：`primary-50~950`、`gray-*`、`success/warning/error/info`（含 `-light`）、`text/bg/border`、`spacing-1~12`、`radius-sm~xl/full`、`font-size-xs~3xl`、`shadow-*`、`duration-*`、`easing`；x 包专属令牌带 `--aura-x-` 前缀。
- **令牌不够用时在 `tokens.css` 新增**（亮 / 暗两套值，如 `--aura-selection-bg`），不要在组件里用透明度 / `color-mix` 现场派生——那会把浏览器特性下限从 Chrome 84 抬到 111。
- 根类名与修饰类命名**分包看齐参照组件**：
  - ui / business：根类 `.aura-<组件名>`（`prefixCls('<组件名>')`），修饰类单横线连写（`aura-badge-dot-small`、`aura-xxx-disabled`）；
  - x：根类 `.aura-x-<组件名>`（`prefixCls('x-<组件名>')`），修饰符用标准 BEM 双横线（`x-sender--disabled`、`x-bubble--filled`），元素连写（`x-sender-header`）。
- 动画 keyframes 命名 `aura-<组件名>-<语义>`；**duration 令牌（150/200/300ms）只用于 transition**，循环动画（`infinite`）的时长用字面值是既有惯例（badge `0.3s`/`0.4s`）；keyframes 只动 `opacity` / `transform` / `background-position` 这类可合成属性。
- 暗色模式差异写在 `[data-theme="dark"] { ... }` 块内（全部走令牌、暗色无差异时可以不写该块）；`.less` 不写 fallback，令牌由 `@aura/ui/style.css` 提供。
- x 包注意：构建后脚本会把全部 less 合并成 `esm/style.css`，源码中照常 `import './index.less'` 即可，不要引入其他样式引入方式。

## Step 5 测试 index.test.tsx

- **三类用例缺一不可**：正常（默认渲染 / 受控往返）、边界（空值 / 极值 / disabled / 阈值）、异常（非法输入 / 回调报错）。
- **断言 DOM 行为，不 mock 渲染层**；只有网络层（如上传）才 mock。定位优先用 `getByText` / `getByRole`，类名断言只用于样式分支。
- **覆盖率是全局硬门禁**（语句 80 / 分支 84 / 函数 65 / 行 80，全仓一起算）：新组件分支覆盖不足会拖垮全局并挂掉 `pnpm verify`。demo/ 目录不计入覆盖率，**不要**把逻辑写进 demo 来"绕过"测试。
- ui 包的视觉组件在 `packages/ui/src/a11y.test.tsx` 追加 axe 基线用例（`await axe(container)` + `toHaveNoViolations`）。
- `tests/setup.ts` 已补齐 `matchMedia` / `ResizeObserver` 等 jsdom 缺口，测试文件无需自己 mock。
- **键盘支持靠语义元素满足**：用原生 `<button>` / `<input>` 时 Enter / Space 激活是免费的，不要写 `fireEvent.keyDown` 的"键盘激活"用例——fireEvent 不模拟原生激活行为，仓库也没有 user-event；键盘测试只对自管理 tabindex 的复合组件（menu / tabs）才有意义。

## Step 6 文档 index.md + demo/

- frontmatter 必填 `title` / `subtitle` / `description` / `order` / `toc: content` / `demo.cols`；**group 决定侧栏分组，取值必须是现有分组**：
  - ui：`通用` / `布局` / `导航` / `表单` / `表单高级` / `数据展示` / `反馈`
  - business：`业务`
  - x：嵌套写法 `group: { title: 交互, order: 402 }`，可用 title：`主题桥接` / `数据流` / `交互` / `会话` / `引导` / `推理`
- **order 先查同组占用**：`grep -A2 '^group' packages/<pkg>/src/*/index.md` 看同组组件的 order 分布，取组内未占用的序号（或组内最大 +1），避免撞号导致排序不稳定。
- 章节结构照抄参照组件：`# 标题` → `## 何时使用`（3 条左右）→ `## 代码演示`（每个 demo 一行 `<code src="./demo/xxx.tsx" description="...">标题</code>`）→ `## API`（Props 表格：属性 / 说明 / 类型 / 默认值，类型用反引号包裹，联合类型转义 `\|`）。
- demo 文件自包含、可独立运行，从 `basic.tsx` 开始按语义命名（如 `controlled.tsx`、`variant.tsx`）。demo 面向阅读，eslint 规则已放宽，但运行时行为必须正确。
- 新组件页会由 `.dumirc.ts` 扫描 frontmatter 自动进入侧栏，无需手改导航配置。

## Step 7 导出与验证

1. **barrel 导出**：在 `packages/<pkg>/src/index.ts` 追加组件与**全部公开类型**（`export { Xxx } from './xxx'; export type { XxxProps, ... } from './xxx';`）。漏导出类型是高频失误——消费方拿不到提示。
2. **用了 async/await 的组件**：跑 `pnpm build:lib && pnpm size`，确认产物无 `_regeneratorRuntime` 内联、体积预算未超（预算见根 `package.json` 的 `size-limit`；新增功能超过预算余量一半时先优化再合入）。
3. **内循环用 `pnpm verify:fast`**（lint → typecheck → test → build:lib → size → smoke）；**推送前跑完整 `pnpm verify`**（含覆盖率阈值，约 40s）。
4. **提交信息**用 Conventional Commits，scope 用包短名：`feat(ui): 新增 Skeleton 组件`、`feat(x): 支持 xxx`、`fix(business): 修复 xxx`；主题行 ≤ 100 字符，可中文。
5. 门禁细节（哪道关卡跑什么、已知缺口）见 `docs/guide/toolchain.md` 的「门禁矩阵」——不要再造检查清单。

## 红线速查（历史上最容易踩）

| 禁止                                    | 改为                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| 硬编码色值 / `!important` / `color-mix` | `var(--aura-*)`；缺令牌就在 `tokens.css` 补（亮暗两套） |
| `any`                                   | `unknown` + 收窄                                        |
| 漏导出 Props 类型或漏 barrel 导出       | 组件与全部公开类型都从 `src/index.ts` 导出              |
| 只写 happy path 测试                    | 正常 / 边界 / 异常三类                                  |
| mock 渲染层、断言实现细节               | 断言 DOM 行为（Testing Library）                        |
| demo 里塞业务逻辑凑覆盖率               | 逻辑进组件或 `utils.ts` 并直测                          |
| 高频事件直接 setState                   | `requestAnimationFrame` 按帧合并 + pointerup 补提交     |
| 凭空发明组件风格                        | 先读参照组件 5 件套，用 references/templates.md 骨架    |
| 只跑 `pnpm test` 就提交                 | 内循环 `verify:fast`，推送前完整 `verify`               |
