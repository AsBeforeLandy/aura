# Changelog

本文件记录 Aura 仓库的重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

### Added — 新包 `@aura/x`（AI 组件库，M1 脚手架）

- 第 8 个包 `@aura/x`：Aura 生态的 AI 对话组件库，对标 `@ant-design/x`。
  M1 交付包骨架与主题桥接层：
  - **`XProvider`**：antd 主题桥接（暗色 / 紧凑 / 主色），令牌映射与
    `BusinessProvider` 共用单一数据源；
  - `buildXThemeConfig` 作为命名导出，便于测试与装饰器场景复用；
  - `--aura-x-*` 令牌组（气泡 / 代码块 / 画布底色，亮暗两套）进入 `tokens.css`；
  - 文档站新增顶级导航「**AI 组件**」（路由前缀 `/x-components`）。
- **M2 数据层**：
  - **`useXStream`**：流式传输层 Hook——fetch + 读流 + SSE / 纯文本两种解析 +
    abort 生命周期（abort 静默结束，卸载自动中止）；解析器 `parseSSEStream`
    为纯函数可独立使用（兼容 BOM / CRLF / 多行 data / 心跳帧，`[DONE]` 哨兵由消费方过滤）；
  - **`useXChat`**：对话消息编排 Hook——user/assistant 成对追加、增量更新、
    loading / 错误态、中止保留部分内容、清空；传输由 `onRequest` 注入，与 useXStream 正交；
  - 文档站新增 `useXStream` / `useXChat` 两个 API 页（含组合示例）。
- **M3 组件闭环**：
  - **`Bubble` / `Bubble.List`**：按角色分侧（user 右 / assistant 左）、loading 三点动画
    （aria-busy）、`contentRender` 扩展点、avatar / header / footer 插槽、列表自动滚动到底；
  - **`Sender`**：Enter 提交 / Shift + Enter 换行 / 中文输入法组词保护；
    loading 时按钮变为「停止」（触发 `onCancel`）；受控与非受控两种用法；
  - **`MarkdownContent`**：基于 react-markdown（可选 peer 依赖）的安全渲染器——
    不渲染原始 HTML、链接协议白名单（http/https/mailto）、外链 `_blank + noreferrer`、
    代码块纯展示；支持流式未闭合语法的块级容错渲染；
  - 文档站新增 Bubble / Sender / MarkdownContent 三个组件页（含可交互 demo：
    mock 逐字流式对话闭环）。
- **M4 外围组件**：
  - **`Welcome`**：对话欢迎区（icon / title / description 居中，extra 插槽放 Prompts；
    board / simple 两种变体）；
  - **`Prompts`**：提示词卡片列表（label + description + icon，纵向 / 横向排列，
    按钮语义键盘可达）；
  - **`Suggestion`**：快捷建议列表（open 受控开合，空列表渲染 null）；
  - **`Think`**：思考过程折叠面板——思考中强制展开并脉冲提示（不可收起），
    完成后默认折叠可回看，标题展示用时；
  - 四个组件均带文档页与 demo，axe 无障碍基线全覆盖。
- **重构**：Aura 令牌 → antd token 的映射收敛到 `@aura/shared` 的
  `antdTokenOverrides()`（纯数据，零 antd 依赖），`BusinessProvider` 同步改用，
  消除与 `@aura/x` 之间的映射重复。

### Fixed — PdfViewer 的 pdf.js 加载方式与版本升级

**结论：不是路径问题。** 同一浏览器、同一 PDF 的对照实验显示——原样 pdf.js 完全正常，
经打包器处理后必然失败，与版本、压缩、语法降级均无关（4.10.38 与 6.3.289 表现一致）。

- **升级 `pdfjs-dist` 4.10.38 → 6.3.289**，并适配其破坏性变更：文档销毁入口由
  `PDFDocumentProxy.destroy()` 改为 **`PDFDocumentLoadingTask.destroy()`**；
  `page.render()` 改为传 `canvas`（6.x 推荐写法）。
- **移除硬编码版本号**：资源地址（cmaps / wasm / iccs / standard_fonts）改为按
  **运行时 `pdfjs.version`** 推导——写死常量会在依赖升级后与实际版本漂移。
- **移除 `new URL(第三方文件, import.meta.url)` 的 worker 引用方式**：该写法会让 worker
  文件进入打包器的 JS 处理管线，实测 dumi/webpack 会把它包进 IIFE、却把顶层 `export`
  留在函数体内，产物不再是合法 ES Module，运行时抛
  `SyntaxError: Unexpected token 'export'`——这正是「文档加载失败」的成因之一。
  现默认改为**主线程渲染**（挂载 `globalThis.pdfjsWorker`，零配置、无外部请求）。
- **新增三个逃生口**（宿主构建无法正确打包 pdf.js 时使用）：`pdfjsSrc`（运行时加载
  原样 pdf.js）、`assetBaseUrl`（自托管资源目录）、`workerSrc`（独立线程渲染）。
  运行时加载以 `new Function` 包裹动态 import，确保不被打包器改写。
- 文档新增「浏览器要求」：pdfjs-dist 6.x 依赖 `URL.parse` 等新 API，需
  **Chrome / Edge 126+、Safari 18+、Firefox 126+**；覆盖更老浏览器需降版本。
- 排查证据（含产物中 webpack 把 pdf.js 的 `import.meta.url` 替换为构建机 `file://`
  绝对路径、worker 被压缩器包进 IIFE 的现象）随本日志与提交记录归档；组件文档的
  「环境要求」章节记录了最终的规避结论。

#### 根因与修复：umi/dumi 的 `Promise.try` 不转发参数

**根因（已定位并修复）**：pdf.js 通过 `Promise.try(action, data)` 把消息参数交给处理器，
而 **dumi / umi 运行时下的 `Promise.try` 会丢弃参数**：`Promise.try((a,b)=>[a,b], 1, 2)`
在纯静态页返回 `[1,2]`，在 umi 页面返回 `[null,null]`。参数被吞后 worker 收到空消息，
于是抛出与真实原因毫无关系的 `Cannot destructure property 'docId'` /
`Cannot set properties of undefined (setting 'onPull')`。

定位路径：同一段代码跨页面跑（纯静态页 ✅ / 任何 umi 页 ❌）→ 插桩 pdf.js 消息通道
（**消息带着数据发出、事件也带着数据投递，但处理器收到 undefined**）→ 逐项排查
`structuredClone`、`MessageHandler` 分发、全局 API 原生性 → 最终锁定 `Promise.try`。

**修复**：组件在每次加载前做一次特性探测，**仅在检测到该缺陷时**把 `Promise.try`
恢复为规范实现（正常环境不做任何改动；`Promise.try` 缺失时不兜底，避免掩盖环境问题）。
修复后实测：文档站示例默认用法即可加载并渲染文档（`canvas 480x300`、页码 `1 / 2`、
无错误态）。

> 至此此前记录的所有失败模式（`Unexpected token 'export'`、`docId`、`onPull`）
> 均已解释并解决。组件侧 13 个单测（新增 `Promise.try` 缺陷恢复用例）全部通过。

### Changed — PdfViewer 弹窗宽度可配置（默认 A4）

- 弹窗宽度由硬编码的 `width="96%"` 抽为 **`width` 参数**，默认取 **A4 纸宽度
  `210mm`**（CSS 的 `mm` 即物理毫米，210mm ≈ 794px）——A4 文档因此恰好按 100% 呈现，
  不再被强行拉伸到视口宽度的 96%。
- 数字按 px，也可传任意 CSS 长度（`96%` 等）；窄屏下 antd 会按视口自动收敛。
- 实测（Chrome 152）：1440 视口下弹窗渲染宽度 **794px**（与 A4 理论值一致）；
  700 视口下自动收敛为 **684px**，无溢出。
- **新增 `autoFitWidth`（默认开启）**：文档加载完成后按容器可用宽度反推缩放（「适合宽度」），
  钳制在 `scaleRange` 内，用户手动缩放后不再干预。
  起因：pdf.js 的 `scale = 1` 是「1pt = 1px」——A4（595pt 宽）只渲染 595px，
  放进 A4 宽（794px）的弹窗里会明显留白；「A4 宽弹窗 + 适合宽度」配合后才真正铺满。
- **修正示例 PDF**：此前样例的 `/MediaBox` 是 `[0 0 480 300]`（≈169×106mm，远小于 A4），
  与新的 A4 弹窗不匹配；已按 **A4（595×842pt）** 重建。
- 实测（Chrome 152，1440 视口）：弹窗 794px、预览区 746px、**画布 746px（完全铺满）**、
  缩放显示 **125%**、页码 `1 / 2`、无错误态。
- 新增 3 个单测（宽度默认/覆盖、适合宽度钳制、关闭自动适配），合计 16 个。

### Docs — 组件文档补全（46 个文档，六类缺口清零）

先做全量体检再动手，逐项量化后在插件层补全：

- **`Button` / `Typography` 的孤儿示例**：两份文档各有 1 个 `demo/basic.tsx`
  已写但未在任何位置引用（用户看不到），且文档是以「按钮类型」「标题」开头、
  缺「基本用法」。现补为各自的第一个示例，并修正示例块之间缺失的空行。
- **`Icon` 文档缺 4 项**：是唯一缺 `description` / `order` / 「何时使用」/
  导入片段的文档；同时把唯一的嵌套 frontmatter 写法（`nav` + `group: { title }`）
  统一为与其余 45 个文档一致的平铺写法。
- **`BusinessProvider` 无可运行示例**（46 个文档中唯一 demo 数为 0）：新增
  `demo/basic.tsx`，演示暗色 / 紧凑切换如何驱动 antd 主题，并说明 `dark`
  只切 antd 算法、Aura 令牌需 `data-theme` 作用域——这是接入时最易踩的点。
- **`@aura/business` README 漏列 `PdfViewer`**：组件总览仍写「8 个」，
  npm 页面会少列一个新组件；补齐组件表并说明 `pdfjs-dist` 依赖与 worker 配置。
- **`standards.md` 统计过期**：「业务包当前 8 个组件」→ 9 个。

### Fixed — 浏览器兼容性声明与实现不符

- 上一轮把拖拽选区遮罩改为 `color-mix`（需 Chrome 111+），而 `installation.md`
  声明的下限是 Chrome 80 / Safari 14——**Chrome 90 用户会看到选区遮罩完全消失**。
  现把该派生色收敛为令牌 `--aura-selection-bg`（亮 / 暗各一套值），组件样式直接
  消费令牌：既无硬编码色值，也不抬高 CSS 特性下限，换肤时只需改令牌。
  同步修正 `.fatherrc.ts` 中已失效的注释。
- 重写「浏览器兼容性」章节：区分 **JS 编译目标**（`chrome 80`）与 **CSS 特性下限**
  （由 Flexbox `gap` 决定，Chrome 84 / Safari 14.1 / Firefox 63），并逐条列出
  所依赖特性、最低版本与用在哪，便于使用者自查。
- `theme.md` 令牌表补充「派生色」类别，并明确提示：换主色时需同步覆盖
  `--aura-selection-bg`，否则选区遮罩仍是默认紫罗兰色；
  `WeekTimeRange` / `YearCalendar` 文档也各加了同样一句。

### Added — 新组件

- **`PdfViewer`（PDF 预览，业务组件）**：基于 pdf.js 的弹窗式预览，支持翻页 / 缩放 /
  旋转 / 拖拽平移。相对其来源项目中的原型，按组件库规范重写：
  - **依赖归位**：原型基于 antd-mobile（移动端库），现以 antd v6 重写；
    `pdfjs-dist@4.10.38` 为常规依赖（原型硬编码 2.10.377 的 CDN worker，
    与 npm 包版本错配会导致渲染崩溃，现 worker 随依赖同版本、经打包器解析，
    并提供 `workerSrc` 覆盖口）。
  - **边界修正**：触发按钮不再内置于组件（调用方组合触发方式）；`open` 受控 /
    非受控双模式；拖拽平移改用 Pointer 事件并经 rAF 按帧合并（原实现高频
    `mousemove` 直接触发 setState）；加载失败呈现错误态与重试按钮（原实现只
    `console.error`，用户面对无限 loading）。
  - **资源安全**：关闭 / 切换 `url` / 卸载时 `destroy()` 文档并取消未完成的
    渲染任务（原型两者皆缺，存在内存泄漏与渲染竞态）。
  - 删除原型遗留的 `console.log('aaa')`；样式全部走 `prefixCls` + 设计令牌；
    纯函数（缩放 / 旋转 / 页码钳制）抽至 `utils.ts`。
  - 新增 10 个测试（含加载 / 翻页 / 缩放钳制 / 旋转归一化 / 销毁 / 受控 /
    失败重试），合计 676 个；文档含 worker 配置与跨域注意事项。

### Fixed — 构建目标导致的产物膨胀（体积近乎腰斩）

- 各包 `.fatherrc.ts` 显式声明 `targets: { chrome: 80 }`（对齐 antd 浏览器底线）。
  此前依赖默认目标，babel 将 `async/await` 降级为 generator 并**按文件**内联
  约 15 kB 的 regenerator helper。收录 `PdfViewer`（业务包首个在组件文件使用
  async 的组件）时被体积门禁拦截，溯源发现该问题早已存在。修正后 brotli 体积：
  **ui 83.39 → 43.8 kB、business 31.95 → 22.49 kB、icons 17.21 → 8.96 kB、
  shared 2.69 → 1.42 kB**；实际兼容下限由样式层的 `color-mix`（Chrome 111+）
  决定，收紧目标不损失可用范围。该条款已写入开发规范文档（构建规范）。

### Added — 开发规范与性能指标文档

- 新增 `docs/guide/standards.md`（指南 →「开发规范与性能指标」），把此前的审计结论
  固化为文档：文件结构 / 样式 / TypeScript / 状态与交互 / 无障碍 / 测试六类规范条款，
  以及体积预算、交互性能要求、覆盖率、耗时基线等实测指标，并列出每条条款对应的守护门禁。
- 文档同时记录测量方式（`pnpm size` / `pnpm test:coverage`）与复测入口，便于后续维护者核对。

### Fixed — 审计发现的规范违规（2 处）

- **拖拽选区遮罩硬编码色值**：`WeekTimeRange` 与 `YearCalendar` 的选区遮罩此前写死
  `rgba(124, 58, 237, 0.22)`（主色 22% 透明），主题被定制或切到暗色时不会跟随。
  改为 `color-mix(in srgb, var(--aura-primary-700) 22%, transparent)`，由主题令牌派生。
  说明：`color-mix` 需 Chrome 111+ / Safari 16.2+ / Firefox 113+，已在样式中注释。
  复测 `@aura/business` 硬编码色值 **0** 处、`!important` **0** 处。
- **测试辅助函数使用 `any[]`**：`cascader-panel` 测试中读取 mock 调用参数的辅助函数
  改为 `unknown[][]` 并在使用处收窄。

### Changed — 结构与可维护性

- **文档站侧边栏改为由文档 frontmatter 自动生成**。`.dumirc.ts` 此前手写 55 条链接，
  与 atomDirs 自动生成的路由构成双份真相：新增组件页不会出现在导航，删除组件页会留死链。
  现于配置求值期扫描 `packages/*/src/<组件>/index.md`，解析 frontmatter 的
  `title` / `group` / `order` 生成侧边栏（兼容平铺 `group: x` 与嵌套
  `group: { title: x }` 两种写法），生成的 45 条与原手写版逐条一致。
  此后新增组件只需写好 frontmatter，导航即自动出现。
- **三个最大业务组件抽出纯函数层 `utils.ts`**，渲染与逻辑解耦、可独立单测：

  | 组件 | index.tsx | utils.ts |
  | --- | --- | --- |
  | `WeekTimeRange` | 475 → 385 行 | 时间解析 / 槽位生成 / 区间合并与裁剪（137 行） |
  | `YearCalendar` | 435 → 360 行 | 全年周网格构建与日期格式化（92 行） |
  | `CascaderPanel` | 389 → 273 行 | 级联树的勾选展开、聚合与状态重算（131 行） |

  对外类型（`TimeRange` / `WeekTimeRangeValue` / `CascaderOption`）移至 utils 后
  仍由组件入口原样再导出，公开 API 不变。

### Fixed — 组件功能与无障碍缺陷（由新增的 a11y 测试发现）

- **`Checkbox` 非受控用法完全失效**。单独使用 `<Checkbox>`（未传 `checked`）时，
  实现里没有内部状态：input 被写成 `checked={false}` 且 `onChange` 为 `undefined`，
  导致**无法点击切换**，组件文档与 demo 中使用的 `defaultChecked` 也被忽略。
  现已补上内部状态，受控 / 非受控 / `defaultChecked` 三种用法均正确，
  并补充 4 个回归测试。
- **`Menu` 使用了 ARIA 规范不允许的属性**：`role="menuitem"` 不支持 `aria-selected`
  （axe 规则 `aria-allowed-attr`），改用全局属性 `aria-current` 表达当前选中项。
- **`Switch` 丢弃了 `aria-label`**：`SwitchProps` 未继承 button 原生属性，
  读屏用户只能听到「开关」而不知道它在控制什么。现继承
  `React.ButtonHTMLAttributes<HTMLButtonElement>` 并向下转发。
- **`Select` 无法被标注**：`role="combobox"` 落在 div 上，`<label>` 无法关联它，
  此前也没有任何 `aria-*` 出口。现继承 `React.AriaAttributes` 并把
  `aria-label` / `aria-labelledby` / `aria-describedby` / `aria-invalid`
  转发到 combobox 元素上。
- **`Slider` 重复表达 slider 语义**：外层容器与滑块本体都写了 `role="slider"`，
  容器不可聚焦也不该承担该角色。现语义只落在滑块本体，
  并转发 `aria-label`；range 模式下两个滑块的可访问名称彼此可区分
  （默认「最小值 / 最大值」，传 `aria-label` 时自动拼接）。

### Added — 工程化工具链（提交门禁 / 体积预算 / 无障碍 / 覆盖率阈值）

- **提交信息门禁**：接入 `@commitlint/cli` + `@commitlint/config-conventional`，
  `.husky/commit-msg` 校验提交信息为 Conventional Commits 格式
  （与仓库既有历史一致）；`pnpm commitlint` 可手动校验。
- **pre-commit 钩子**：husky + lint-staged，对暂存的 `*.{ts,tsx}` 执行 `eslint --fix`。
  说明：**尚未**在此接入 Prettier，避免在「整体格式化」完成前于每次提交中产生零散的格式改动。
  `prepare` 脚本改为 `husky && dumi setup`（husky 先于 dumi 安装钩子）。
- **产物体积预算**：接入 size-limit，按「全量 esm 汇总、brotli」实测并设置阈值
  （shared 4 kB / icons 22 kB / ui 95 kB / business 36 kB，实测 2.69 / 17.21 / 79.61 / 29.24 kB）。
  `pnpm size` 可单独运行，已加入 `verify` 与 CI。
- **无障碍测试**：接入 jest-axe，新增 `packages/ui/src/a11y.test.tsx` 覆盖 21 个用例。
  说明：jsdom 不做真实布局，axe 的 color-contrast 规则不生效，本测试覆盖语义层
  （label / role / aria / 标题层级）。
- **覆盖率阈值与统计口径修正**：vitest coverage 改为**正向白名单**口径
  （只统计 `packages/*/src`，排除 demo / 测试文件 / 顶层 barrel）。
  此前的全量口径会把 `esm/` 产物、demo、`scripts/` 都算进去，总覆盖率被拉到 41%，
  失去防止回退的意义。修正后实测 语句 83.2% / 分支 86.76% / 函数 68.75% / 行 83.2%，
  阈值据此设为 80 / 84 / 65 / 80（留有余量防止立即失败，提升覆盖率时应同步上调）。
- CI 工作流更新：测试改用覆盖率模式以强制阈值，新增体积预算检查，
  流水线为 `Lint → Typecheck → Coverage → Build → Size → Smoke`。

### Fixed — 消费侧类型解析（`.d.ts` 中的样式导入）

- **从产出的 `.d.ts` 中剥离样式副作用导入**。组件源码遵循样式与逻辑分离，
  每个 `index.tsx` 都 `import './index.less'`，father 会把它保留进声明文件；
  消费者在 `skipLibCheck: false` 下会逐文件报
  `TS2882: Cannot find module or type declarations for side-effect import`（实测约 45 个文件）。
  新增 `scripts/postbuild-dts.mjs` 在构建后清理，并接入 `build:lib`；
  同时顺带清理 father 对 triple-slash 路径引用的错误改写产物。
  冒烟测试新增对应断言以防回归。

### Fixed — 代码质量

- **ESLint 告警由 172 条清零**（其中 2 条 error）：移除未使用的导入与解构绑定、
  删除 `icons` 中从未被引用的 `IconWrapper` 死代码、`message` 保留 `getContainer()`
  的副作用而仅去掉无用绑定、`steps` 精简上下文解构。
- **修正 `select` 的 `handleSelect` 遗漏依赖 `currentValue`**：多选分支读取当前数组，
  依赖缺失会让连续两次选择基于同一份过期快照而互相覆盖。
- **`form` 内的 5 处 `any` 收敛为 `unknown`** 并补充必要的窄化；
  `renderChildren` 的 `childType` 改为「组件对象 | 宿主标签名」联合类型，比原 `any` 更准确。
- **两处刻意写法改为带理由的行内豁免**：`cascader-panel` 的公开索引签名
  `[key: string]: any`（用于透传调用方自定义字段，收窄属破坏性变更）、
  `form` 中只在挂载时执行的初始化 effect。
- **修正 ESLint 配置覆盖面**：`files` 原先只匹配 `packages/*/src`，导致 `tests/`
  退回默认解析器并在 TS 语法处解析失败；现覆盖全仓 `**/*.{ts,tsx}`，`lint` 脚本改为 `eslint .`。
- **修正 `icons` 的 API 文档**：`size` 默认值由误写的 `1em` 更正为 `24`（`number`），
  并移除并不存在的 `spin` 属性说明。
- 新增 `ignoreRestSiblings` 选项，覆盖「解构出来只为排除出 `...rest`」的写法。

### Performance

- **`ProTable` 消除无谓重渲染**：`pagination` 对象与 `handleSearch` / `handleReset`
  此前每次渲染都重建并透传给 `SearchForm` / `Table`，必然击穿子组件的浅比较；
  现分别以 `useMemo` / `useCallback` 收敛。

### Added — 补齐声明了却从未生效的 prop

以下 prop 此前已写进类型与文档、却没有任何实现（见「待决策」的历史记录），现已全部落地：

- **`Menu` 的 `collapsible`**：开启后在菜单顶部渲染折叠开关，折叠态仅展示图标
  （隐藏文字、箭头与分组标题，图标居中收窄）。横向模式没有可折叠的宽度收益，不生效。
  折叠态为纯内部展示状态，未引入 `openKeys` 之类的新 API。
- **`Menu.SubMenu` 的 `subKey`**：用于生成确定性的子菜单面板 id
  （`aura-menu-submenu-panel-<subKey>`），展开时由标题通过 `aria-controls` 关联，
  并在根节点输出 `data-sub-key`，便于测试与上层持久化展开状态。
- **`Input.Search` 的 `searchButtonText`**：不传时保持图标形态（默认不变）；
  传入时以文案替代图标，并作为按钮的可访问名称。
  **顺带修复**：搜索按钮此前只有 `role="button"` 却没有任何点击行为，
  现支持点击与键盘（Enter / Space）触发 `onSearch`。
- **`Dragger` 的 `children`**：用于替换默认拖拽区内容，未传时保持原样。
- **`Upload` / `Dragger` 的 `action` 与 `headers`**：配置 `action` 后选择文件即发起
  真实 POST（multipart/form-data，字段名 `file`），成功置为 `done`、失败置为 `error`；
  `headers` 原样附加。未配置 `action` 时保持原有的本地模拟流程，行为向后兼容。
  请求逻辑抽到 `packages/ui/src/upload/request.ts`，与渲染解耦、便于 mock。

以上共补充 15 个测试用例（合计 666 个）。

### Fixed — 交付链路（产物此前无法被下游消费）

- **恢复 `@aura/business` 的声明文件产出**。`cascader-panel` 中两处把 `string[]` 传入
  期望 `ReadonlySet<string>` 的形参，导致 `father build` 在声明生成阶段抛出 `TS2345`，
  `esm/` 下 `.d.ts` 数量为 0。现已先行 `new Set(...)` 归一化。
- **移除 `@aura/ui` 与 `@aura/business` 的 `esm.alias` 配置**。father 的 bundless 模式会把被
  alias 命中的裸包名改写成仓库内相对路径（`@aura/shared` → `../../../shared/src`），
  该路径在发布后的 `node_modules` 中并不存在，等于产物对下游完全不可用。
  移除后跨包导入保持裸包名，由使用方的包管理器解析。
- **打通 `@aura/business` 的主题令牌链路**。该包全部 `.less` 使用 `var(--aura-*)` 且不设
  fallback，但未声明令牌提供方依赖；现声明 `@aura/ui` 为依赖，并在入口引入
  `@aura/ui/style.css`，使单独安装 `@aura/business` 也能正确渲染。
- **修正包导出协议**（`shared` / `request` / `icons` / `ui` / `business`）：
  `exports` 条件改为 `types` 优先（原顺序不符合 TypeScript 规范，`node16` / `nodenext`
  解析下会失败）；补齐 `main` 字段（此前缺失，CJS 与旧版打包器无法解析）；
  补齐 `"type": "module"` 与 ESM 产物保持一致。
- **补全 `sideEffects`**：`ui` / `business` 增加 `**/*.css`，避免主题令牌被 tree-shaking 误摇除。
- **修正文档中的错误引入路径**。`quick-start` 原先教用户 `import '@aura/ui/src/theme/tokens.css'`，
  但发布包只含 `esm/`，该路径必然报 `Module not found`；现改为 `@aura/ui/style.css`。
- **`@aura/cli` 补齐 `files` 字段**，避免发布时夹带源码与配置。

### Fixed — 类型与代码规范

- 移除根 `tsconfig.json` 与 `packages/{ui,business}/tsconfig.json` 中已弃用的 `baseUrl`，
  此前会导致 `tsc` 直接报 `TS5101` 而**完全无法进行类型检查**。
- **类型版本对齐**：`@types/react` / `@types/react-dom` 由 19 降回 18，与运行时 `react@18` 一致。
- 修复 `packages/ui/src/menu` 中 `useRef<HTMLDivElement>(null)` 在 React 18 类型下
  `current` 只读导致的 `TS2540`。
- 修复 `packages/ui/src/typography` 的空接口 `TypographyProps`，改为类型别名。
- 统一根 `tsconfig.json` 的 `include` / `exclude`，避免全仓扫描。

### Performance

- **拖拽框选改为按帧合并坐标更新**（`useDragSelect`）。此前每次 `mousemove` 都触发
  `setState`，导致 `WeekTimeRange`（336 格）/ `YearCalendar`（约 371 格）按事件频率整体重渲染；
  现以 `requestAnimationFrame` 合并为每帧至多一次，并在抬起时补提交末尾坐标。
- **`CascaderPanel` 去除渲染期的全树 `JSON.stringify`**。此前每次渲染都序列化整棵选项树，
  仅为了给 `useEffect` 当依赖；现直接以 `options` / `value` 作为依赖。
- **`CascaderPanel` 选中态查找由 O(n) 降为 O(1)**。新增 `selectedSet` 视图替换逐项 `includes`，
  并将 `commit` 以 `useCallback` 收敛，消除 `react-hooks/exhaustive-deps` 告警。
- `useDragSelect` 的 `containerProps` 改为 `useMemo`，并补齐 rAF 卸载清理。

### Added — 工程化门禁

- **引入 ESLint（flat config）与 Prettier**，补齐 `.editorconfig`。
  此前 `package.json` 声明了 `lint` 脚本但未安装 eslint，规范处于「纸面存在、实际不运行」状态。
- **新增产物冒烟测试 `scripts/smoke.mjs`**，校验：入口字段与 `exports` 目标文件存在、
  声明文件已产出、产物中无逃出包目录的相对路径、裸包名依赖均已声明、
  相对引用的资源存在、主题令牌随包发布。
- **新增 PR 校验工作流 `.github/workflows/ci.yml`**：`lint → typecheck → test → build:lib → smoke`。
- **新增 `typecheck` / `smoke` / `verify` / `format` / `test:coverage` 脚本**；
  `prepublishOnly` 保证发布前先构建并通过冒烟测试。
- **`build:lib` 由手写串行链改为 `pnpm -r build`**，按依赖拓扑自动排序，且不再遗漏 `cli`。
- `deploy.yml` 与 `ci.yml` 的安装步骤加 `--ignore-scripts`，规避 `prepare: dumi setup` 在 CI 中卡住。
- 新增 `@vitest/coverage-v8`，支持覆盖率统计。

### Added — 治理与文档

- 新增根目录 `LICENSE`（MIT 正文）。此前 5 处声明 MIT 却无协议文件，企业合规审查会直接卡住。
- 新增 `.npmrc`、`.nvmrc`、根 `package.json#engines`，锁定 Node 与 registry 行为。
- **7 个包全部补齐 README**，此前 npm 页面为空白。
- 新增 `packages/business/src/provider/index.md` 并加入侧边栏导航；
  `BusinessProvider` 此前无文档、不在导航中，而它正是主题接入的关键组件。
- ~~新增 `packages/icons/src/index.md` 修复文档站 `/components/icons` 死链~~
  **（本条为误判，已在后续提交撤销）**：`/components/icons` 一直有文档
  （`packages/icons/src/icons/index.md`），而 `/components` 总览页由 dumi 依据
  atomDirs 自动生成。新加的文件反而以 Icon 文档**覆盖了自动生成的组件总览页**，
  已删除并回归验证。
- 新增 `packages/business/src/provider/index.md` 并加入侧边栏导航；
  `BusinessProvider` 此前无文档、不在导航中，而它正是主题接入的关键组件。

### Changed — 包治理

- **7 个包全部标记 `private: true`**。此前均无该标记且版本统一为 `0.0.1`，
  一次 `pnpm publish -r` 即可将半成品推送到 npm，且 npm 不允许复用已发布版本号。
- `@aura/ui` 的 `files` 移除不存在的 `dist`。
- `@aura/skill` 明确标注为「非代码包」，补充说明其提示词资产性质。

---

## [0.0.1] — 初始版本

- Aura Monorepo 初始化：`shared` / `request` / `icons` / `ui` / `business` / `cli` / `skill`。
- 基于 dumi 2 的文档站，支持 GitHub Pages 自动部署。
