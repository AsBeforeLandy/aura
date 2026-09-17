---
title: 开发规范与性能指标
description: Aura 组件库的编码规范、性能基线与守护机制
order: 7
toc: content
---

# 开发规范与性能指标

本页是 Aura 组件库的编码规范与性能基线。**每一条条款都由仓库内的门禁自动守护**（见文末「守护机制」），而不是口头约定 —— 违反任何一条，`pnpm verify` 或 CI 都会失败。

> 数据为实测值，测量方式见各节说明。新增/修改组件时请对照本页自检。

## 一、代码规范

### 1. 文件结构

每个组件一个目录，结构固定：

```text
packages/<pkg>/src/<组件名>/
├── index.tsx        # 组件实现：渲染 + 交互
├── index.less       # 样式，与逻辑分离
├── index.md         # 文档与示例，frontmatter 提供 title / group / order
├── index.test.tsx   # 测试：正常 / 边界 / 异常
├── demo/            # 示例代码（不参与构建与覆盖率统计）
└── utils.ts         # （可选）纯函数层，复杂组件把日期、树运算等抽到这里
```

- 单文件 `index.tsx` 以 **400 行**为软上限；超出应把纯逻辑抽入 `utils.ts`，把视觉块拆成子组件。
- `utils.ts` 中的函数**不得依赖 React**，保证可以不渲染组件就完成单测。
- 业务包（`@aura/business`）当前 9 个组件全部符合该结构。

### 2. 样式规范

| 条款 | 说明 |
| --- | --- |
| 只用设计令牌 | 颜色、圆角、间距一律 `var(--aura-*)`，**禁止硬编码色值**（hex / rgb / rgba） |
| 派生色收敛到令牌层 | 需要「主色 + 透明度」这类派生色时，**必须**在 `tokens.css` 中新增令牌（亮 / 暗两套值，如 `--aura-selection-bg`），组件样式直接消费令牌；**不要**在组件里用 `color-mix` 临时派生——那会把浏览器特性下限从 Chrome 84 抬到 111 |
| 禁止 `!important` | 优先级问题通过选择器结构解决 |
| 令牌缺失即失效 | `.less` 不设 fallback，主题令牌由 `@aura/ui/style.css` 提供（依赖链已声明） |

> 现状实测：`@aura/business` 硬编码色值 **0** 处、`!important` **0** 处，
> 且不依赖 `color-mix` 等较新特性（浏览器下限见「安装 → 浏览器兼容性」）。
> 拖拽选区遮罩曾硬编码 `rgba(124,58,237,.22)`，一度改为 `color-mix` 派生，
> 最终收敛为令牌 `--aura-selection-bg`：既无硬编码，也不抬高特性下限。

### 3. TypeScript 规范

| 条款 | 说明 |
| --- | --- |
| 禁止 `any` | 需要宽类型时用 `unknown`，并在使用处收窄（`as` / 类型守卫） |
| 受控豁免需留痕 | `CascaderOption` 的公开索引签名 `[key: string]: any` 是**唯一**豁免 —— 用于透传调用方自定义字段，收窄属破坏性变更；该行带 eslint-disable 与理由注释 |
| 对外类型显式导出 | `Props` 与公开数据类型从组件入口导出；内部类型不进公开 API |
| `useRef` 可变性 | React 18 类型下写 `useRef<T \| null>(null)`，否则 `current` 只读 |
| 事件类型收窄 | 处理函数签名用具体事件类型或 `unknown`，禁止 `any` 一路透传 |

### 4. 状态与交互规范

| 条款 | 说明 |
| --- | --- |
| 受控 / 非受控双模式 | `value` + `onChange` 受控，`defaultValue` 非受控；内部维护 `isControlled = value !== undefined` |
| 受控时不自改状态 | 受控模式下交互只回调 `onChange`，由调用方决定是否更新 |
| 语义化 aria | 可交互元素必须有可访问名称（`aria-label` / `aria-labelledby`）与键盘支持（Enter / Space） |
| 仅用受支持的 aria | `aria-selected` 不能用于 `role="menuitem"` 之类的不合法组合，axe 会拦截 |
| 子菜单 / 面板需有稳定标识 | 如 `subKey` 生成确定性面板 id，供 `aria-controls` 关联与测试定位 |

### 5. 测试规范

| 条款 | 说明 |
| --- | --- |
| 三类用例 | 每个组件至少覆盖**正常**（默认渲染 / 受控）、**边界**（空值 / 极值 / disabled）、**异常**（非法输入 / 回调报错） |
| 不 mock 渲染层 | 断言 DOM 行为而非实现细节；网络层（如上传）才 mock |
| 覆盖率阈值 | 语句 ≥ 80%、分支 ≥ 84%、函数 ≥ 65%、行 ≥ 80%（见 vitest 配置，随实测上调） |
| 覆盖率口径 | 只统计 `packages/*/src`，demo / 顶层 barrel / 构建产物不计入 |

### 6. 构建规范

| 条款 | 说明 |
| --- | --- |
| 编译目标显式声明 | 各包 `.fatherrc.ts` 统一 `targets: { chrome: 80 }`（与 antd 浏览器底线对齐）。**禁止依赖默认目标**：默认目标含过老浏览器，babel 会把 `async/await` 降级为 generator，并**按文件**内联约 15 kB 的 regenerator helper——体积随含 async 的文件数线性膨胀 |
| 新增 async 模块需复查产物 | 合入前跑 `pnpm build:lib && pnpm size`，确认产物无 `_regeneratorRuntime` 内联且体积预算未超 |

> 案例：收录 `PdfViewer`（首个在组件文件中使用 `async/await` 的业务组件）时，
> 体积门禁拦截了 +9 kB 的预算超标，溯源发现 ui 包产物因此前的默认目标已被
> regenerator 撑大近一倍。显式声明目标后，ui 83.39 → 43.8 kB、business 31.95 → 22.49 kB（brotli）。

## 二、性能指标（实测）

### 1. 产物体积预算

测量方式：size-limit，按各包全量 `esm/**/*.js` 汇总后 brotli 压缩。`pnpm size` 可随时复测。

| 包 | 实测 | 预算 | 余量 | 状态 |
| --- | --- | --- | --- | --- |
| `@aura/shared` | 1.42 kB | 4 kB | 64.5% | ✅ |
| `@aura/icons` | 8.96 kB | 22 kB | 59.3% | ✅ |
| `@aura/ui` | 43.8 kB | 95 kB | 53.9% | ✅ |
| `@aura/business` | 22.49 kB | 36 kB | 37.5% | ✅ |

> 规则：**新增功能超过预算余量的一半时，先优化再合入**。阈值在根 `package.json` 的 `size-limit` 配置中，CI 会强制校验。

`@aura/business` 各组件产物（原始 esm，未压缩）：

| 组件 | 体积 | 组件 | 体积 |
| --- | --- | --- | --- |
| WeekTimeRange | 32 kB | SearchForm | 16 kB |
| YearCalendar | 28 kB | ProTable | 12 kB |
| PdfViewer | 28 kB | PageContainer | 12 kB |
| CascaderPanel | 24 kB | ModalForm | 12 kB |

### 2. 交互性能要求

| 条款 | 说明 | 现状 |
| --- | --- | --- |
| 高频事件按帧合并 | 拖拽、滚动等连续事件**必须**用 `requestAnimationFrame` 合并状态更新，每帧至多一次渲染 | `useDragSelect` 已实现（`WeekTimeRange` 336 格 / `YearCalendar` 约 371 格） |
| 禁止渲染期序列化 | 不得在渲染路径中对大树做 `JSON.stringify` / 深比较，成本随节点数线性增长 | `CascaderPanel` 已消除 |
| 集合查找用 Set / Map | 列表内 `includes` 的 O(n) 查找在交互热路径上应换成 `Set`（O(1)） | `CascaderPanel` 已实现 |
| 下传引用保持稳定 | 传给子组件的对象 / 回调用 `useMemo` / `useCallback` 收敛，避免击穿子组件浅比较 | `ProTable` 已实现（`pagination` + 三个回调） |
| 拖拽结束补提交 | 最后一帧之后若事件停止，须在 pointerup 时提交末尾坐标，避免丢最后一次更新 | `useDragSelect` 已实现 |

### 3. 覆盖率实测（`@aura/business`）

| 组件 | 语句 | 分支 | 函数 | 行 |
| --- | --- | --- | --- | --- |
| CascaderPanel | 100% | 98.9% | 100% | 100% |
| ModalForm | 100% | 90% | 100% | 100% |
| PageContainer | 100% | 93.3% | 100% | 100% |
| Provider | 100% | 100% | 100% | 100% |
| SearchForm | 99.1% | 96% | 100% | 99.1% |
| ProTable | 96.7% | 92.3% | 100% | 96.7% |
| YearCalendar | 92.7% | 91.2% | 100% | 92.7% |
| PdfViewer | 88.2% | 80% | 68.8% | 88.2% |
| WeekTimeRange | 88.9% | 89.2% | 100% | 88.9% |
| useDragSelect（内部） | 89.2% | 78.9% | 50% | 89.2% |

复测方式：`pnpm test:coverage`（本地）或 `coverage/` 目录下的 HTML 报告。

### 4. 测试与构建耗时基线

| 指标 | 实测 |
| --- | --- |
| 全量测试 | 676 个用例，约 10 ~ 12 s |
| `pnpm verify` 全链路 | 约 35 s（lint → typecheck → test → build → size → smoke） |
| 文档站构建 | 约 30 s（284 个页面） |

## 三、守护机制

规范不靠自觉，靠门禁。以下任何一步失败，提交或 CI 都会失败：

| 门禁 | 命令 | 守护的规范 |
| --- | --- | --- |
| 代码检查 | `pnpm lint` | 未使用变量、exhaustive-deps、禁止 `any`（含理由豁免） |
| 类型检查 | `pnpm typecheck` | 类型正确性、导出协议 |
| 单元测试 | `pnpm test:coverage` | 行为正确性 + 覆盖率阈值 |
| 产物构建 | `pnpm build:lib` | 产物可构建、声明文件产出 |
| 声明清理 | `scripts/postbuild-dts.mjs` | 声明文件中无样式副作用导入 |
| 体积预算 | `pnpm size` | 上表中的体积上限 |
| 产物冒烟 | `pnpm smoke` | 入口 / exports / 相对路径 / 令牌随包发布 / 文档路径真实存在 |
| 提交门禁 | husky + lint-staged + commitlint | 暂存代码自动修复、提交信息为 Conventional Commits |

一键执行：`pnpm verify`（约 35 s）。CI 在每次推送时跑同一条链路。
