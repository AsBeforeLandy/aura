# Changelog

本文件记录 Aura 仓库的重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

### Changed — 包名 scope 迁移至 `@aura-react-comp/*`，发布链路落成

仓库此前所有包都在 `@aura/*` 下，但 npm 要求 **scope 必须与组织名完全一致**，
而 `aura` 这个组织名已被占用。为此把 8 个包的标识符统一迁移到实际持有的组织
`@aura-react-comp` 下，并把从零到一的发布链路补齐。

- **包名迁移**：全仓 447 个文件、748 处 `@aura/` → `@aura-react-comp/`。
  替换只针对这一条前缀模式，因此 `--aura-*` 主题令牌、dumi 的
  `base: '/aura/'`、CLI 的 bin 名 `aura`、品牌名 `Aura` 均未被波及。
  alias（`.dumirc.ts` / `vitest.config.ts`）与 `tsconfig.json#paths` 同步更新，
  并保持了「`.../ui/style.css` 必须排在 `.../ui` 之前」的声明顺序。
- **npm 元数据补齐**：8 个包此前**全部缺失** `repository` / `homepage` / `bugs` /
  `publishConfig` / `keywords` / `author`。`repository.url` 是 OIDC provenance 与
  `npm trust` 的强校验项，缺失或不匹配会直接报 E422。
- **6 个库包转为可发布**：`shared` / `request` / `icons` / `ui` / `business` / `x`
  移除 `private`，版本由占位的 `0.0.1` 提为 **`0.1.0`**，并写入
  `publishConfig.access: public`（scoped 包首发缺它会撞 402 付费墙）。
  `cli` / `skill` 维持 `private`，留待二期。
- **`packages/x` 补齐 `README.md`**：此前它是唯一没有 README 的包，npm 页面会是空白。
  新 README 同时说明了它对基础设计令牌的依赖关系。
- **新增 `scripts/sync-license.mjs`**：npm 只会打包**包目录内**的文件，仓库根的
  LICENSE 不会自动继承。该脚本按 `private !== true` 自动派生待发布包清单，
  把根 LICENSE 同步到各包目录，并接入 `build:lib`。
- **删除根 `prepublishOnly`**：`pnpm -r publish` 会对**每个包各触发一次**该钩子，
  等于把全量构建重复跑 6 遍。门禁改为在发布流程中显式执行一次 `pnpm verify`。
- **引入 changesets**：新增 `.changeset/config.json`（`access: public`、
  `baseBranch: master`、`updateInternalDependencies: patch`，不设 `fixed` 组）
  与日常使用说明；各包版本与 CHANGELOG 后续由 `changeset version` 统一产出，
  不再手改。
- **新增 `.github/workflows/release.yml`**：发布工作流，链路与 aura-vue 对齐
  （**main 直发，不走版本 PR**）：门禁 → changesets 消费版本并提交回 master →
  发布到 npm（带 provenance 供应链声明）→ 推 tag。认证走 `NPM_TOKEN`
  ——首次发布时包在 npm 上尚不存在、无法绑定 Trusted Publisher，这条路必须留着。
  `id-token: write` 已就位，将来为 6 个包绑好 Trusted Publisher 后删掉
  `NODE_AUTH_TOKEN` 即可自动切到 OIDC。未配置 `NPM_TOKEN` 时整体跳过发布，
  链路仍然跑得通、CI 不会红。
- **发布脚本对齐 aura-vue**：新增 `pnpm release`（构建 + 发布）与 `pnpm version`。
  changesets 的 changelog 改用**默认实现**——`@changesets/changelog-github` 要访问
  GitHub API，会让「本地直接发布」拿不到 PR 信息。
- **文档**：新增「发布流程」指南页（本地直接发布 / CI 自动发布 / dist-tag 与
  beta 周期 / 失败排查表）。

> 与 npm 认证现状相关的背景：classic / automation token 已下线，只剩
> Granular Access Token（须勾选 Bypass 2FA）；Trusted Publisher 只能绑定
> **已存在**的包，因此全新包名的**首次发布必须先用 token 发一次**，
> 之后才能切到 OIDC。这两个约束决定了发布流程分两段。

### Docs — 新增「工程化工具链」页，并消除「守护机制」的两处真相

梳理仓库工具链时发现：`docs/guide/standards.md` 的「守护机制」表与
`package.json#verify`、`ci.yml` 的实际行为**不一致**，且它自身的数据已过期。
本次把工具链收敛成一份可维护的地图，并修掉漂移。

- **新增 `docs/guide/toolchain.md`（「工程化工具链」）**：分层总览（13 层 ×
  工具 / 版本 / 守护什么）、包形态、**门禁矩阵**（pre-commit × `pnpm verify` × CI
  三列对照）、**任务编排**、测试与覆盖率口径、**已知缺口（P0×2 / P1×3 / P2×5）**、
  如何扩展。侧栏 `.dumirc.ts` 同步新增 `/guide/toolchain` 入口。
- **任务编排一节明确了「没有专用编排器」这件事**：仓库无 Turbo / Nx / Lage / Rush /
  Wireit / concurrently / npm-run-all 的配置与依赖，编排由 5 个层次各自的原生机制分担
  —— pnpm `-r` 递归（含**拓扑排序**与默认 4 并发）、npm scripts 的 `&&` 线性链、
  Vitest 的文件级并行、husky + lint-staged 的暂存文件编排、GitHub Actions 的
  job/step 与 `concurrency`。附上**实测的拓扑顺序**（叶子包在前，`business`
  因依赖 `ui` 最后执行）与包依赖图。
- **补充通用的「什么场景才值得上编排器」判据**：先给三个必要条件（有可缓存的昂贵产物 /
  存在真实的跨包**产物**依赖 / 触发频次足够高），再列组件库特有的加分场景（一套源码出
  多份产物与多框架适配、混着重活、包数上双、CI 分钟数受限、发布频繁）与「不值得」的信号；
  并给出「上编排器之前先做的五件更便宜的事」（量化瓶颈、`--filter '...[origin/master]'`
  选择性执行、Vitest `--changed`/`--shard`、CI `paths:` 过滤、缓存安装）。
  另特别指出**别混淆构建编排与发布编排**——后者是 changesets 的领域。
- **修正一处论断的依据**：核对各包 `tsconfig.json` 后确认
  `paths` 全部指向 `../<包名>/src/index.ts`（**源码**），father bundless 又把裸包名
  保持为外部导入，因此构建 `business` **不会读取 `ui/esm`**——
  这既证明「拓扑顺序不影响正确性（`--no-sort` 也能构建成功）」，也说明缓存命中空间很小。
  同时把「新增包」的扩展清单补全为三处必改（`size-limit`、根 `tsconfig.json` 的 `paths`、
  **本包 `tsconfig.json` 的 `paths`**——最后一处最易漏）。
- **订正 `standards.md`**：
  - 耗时基线里的「676 个用例」过期为 **870 个用例 / 73 个测试文件**；
  - 「守护机制」表**收敛为指向工具链页**——此前它把「覆盖率阈值」挂在
    `pnpm test:coverage` 下，却又写「一键执行 `pnpm verify`、CI 跑同一条链路」，
    而本地 `verify` 跑的其实是 `pnpm test`（不含覆盖率阈值），
    会让人误以为本地也会卡覆盖率。同一份事实出现两处必然漂移，现只保留一处。
- **梳理出的缺口**（详见工具链页「已知缺口」）：
  - **P0**：`pnpm format:check` 不在任何门禁内，且仓库当前不符合 Prettier 风格
    （`packages/x/src` 单包就有 62 个 `.ts/.tsx`、23 个 `.less/.md` 未通过）——
    属于「看起来有检查、实际没有」的假门禁；
  - **P1**：`lint-staged` 的 `.less` / `.md` / `.yml` 覆盖未开（与格式策略同源，见下）；
  - **P1**：无 changesets，版本与 CHANGELOG 全靠手写；
  - **P2**：无构建缓存与「只跑受影响的包」；无 E2E / 视觉回归；
    无 `eslint-plugin-jsx-a11y` 静态检查；无依赖更新自动化；
    TypeScript 6 + ESLint 10 与 pnpm 7.33.7 的版本组合同样偏两端。

### Fixed — 本地门禁与 CI 对齐（`verify` 纳入覆盖率阈值）

- **`pnpm verify` 的测试步骤由 `pnpm test` 改为 `pnpm test:coverage`**：
  此前覆盖率阈值**只在 CI 生效**，本地「一键门禁」实际弱于 CI，
  是个名副其实的假保障（而文档还写着两者同链路）。现在两端真正跑同一条链路。
- **新增 `pnpm verify:fast`**：保留原链路（跳过覆盖率插桩）用于紧凑内循环，
  避免「为了严起来把日常反馈变慢」。推送前仍应跑一次完整的 `pnpm verify`。
- **`lint-staged` 增加 `*.json` → `prettier --write`**：实测 `.json` 是当前**唯一**
  全部符合 Prettier 输出的扩展名，纳入后不会引入无关重排。
- **`.less` / `.md` / `.yml` 刻意暂未纳入**：实测 `.less` 有 39 个、`docs/**/*.md`
  有 7 个未通过 `prettier --check`，纳入后**下一次提交就会把无关内容一起重排**
  （`.md` 表现为表格对齐）。这属于格式策略决策，不是能顺手做的杂活——见下条。
- **订正 P0 的描述**：工具链页新增「格式策略的三种处理方式」。
  此前把该问题写成「必须二选一」（全量重排 / 删掉脚本）是**不准确**的——
  Prettier 官方对大型代码库推荐的**增量收敛**（只格式暂存文件、不做全量重排）
  是同样可行的第三条路，且更适合单人维护的仓库。
  `standards.md` 中「覆盖率阈值只在 CI 生效」的说明同步订正。
- **补记根因**：这次的不一致并非笔误，而是**门禁链路被定义在两处**
  （`package.json#verify` 与 `ci.yml` 的各 step），且没有任何机制保证两者同步。
  已作为 P2 记入工具链页「已知缺口」，附两种收敛方案（CI 改单步 `pnpm verify` /
  加自检脚本比对步骤集合），避免下次再各改一边。

### Changed — 格式策略定为「增量收敛」，P0 清零

上一节提到格式策略待定。本节的决策依据是**一次实测的规模统计**：仓库中不符合
Prettier 输出的文件远超预期——**仅 `packages/ui` 一个包就有 245 个**，
`packages/x` 单 `src` 目录 85 个、`icons` 15 个、`shared` 5 个……
全仓保守估计 **360+**（分片扫描被沙箱中断，实际只会更多）。

这个数字直接否掉了「全量重排」：一个改写 360+ 个文件的 `style:` 提交会让
**整个 `@aura-react-comp/ui` 的 `git blame` 失去意义**，代价与收益完全不成比例。

- **采纳「增量收敛」**：`lint-staged` 的 prettier 范围由 `*.json` 扩到
  `*.{json,less,md,yml,yaml}`——只格式化**暂存**文件，不做全量重排。
  Prettier 官方对大型代码库同样推荐这条迁移路径。
- **代价已衡量并接受**：启用时待提交的 20 个 `.less` / `.md` 文件约产生
  **617 行**重排，会混入随后的提交。
- **补上收敛的完成判据**（这条必须有，否则会永久悬着）：
  `npx prettier --check "{packages,tests,docs}/**/*.{ts,tsx,js,jsx,json,css,less,md}"`
  输出 `All matched files use Prettier code style!` 即收敛完成，
  **届时把 `format:check` 纳入 `verify` 与 CI**。
- **重新定性 `format:check`**：它此前是「看起来有、实际没有」的假门禁；
  现在角色明确为**收敛进度探针** + 提交期已强制格式 + 有退出判据，
  因此**从 P0 降为 P2**（跟踪项，自愈型）。结论：**「已知缺口」里 P0 已清零**。

### Fixed — `@aura-react-comp/request` 补上体积预算（体积预算覆盖 5/6 → 6/6）

同批缺口里最容易清的一个：`size-limit` 只给 5 个 father 库包设了预算，
`@aura-react-comp/request` 一直没被守护。实测产物 **1.06 kB brotlied**，按仓库惯例
（圆整 + 约 1.9x 余量）定为 **2 kB**，并把 6 条预算按包表顺序重排
（shared / request / icons / ui / business / x）。

### Added — `useXChat` 支持多会话（`conversationKey`）与完整会话切换闭环

做「`Conversations` + `Bubble.List` 会话切换闭环」时暴露了能力缺口：
多会话切换需要「按 key 换上下文」和「直接写回消息」两件事，
而 `useXChat` 两样都没有——只能靠 `key` 强制重挂载组件来绕，属于教坏人的写法。
本次把缺的补齐：

- **`conversationKey`**：会话唯一标识。变化时按 `defaultMessages` 重新初始化消息，
  并**中止上一个会话在途的请求**。
- **`defaultMessages`**：`XMessage[]` 或 `({ conversationKey }) => XMessage[] |
Promise<XMessage[]>`，可异步拉取历史。只在**挂载**与 **`conversationKey` 变化**时
  求值（内部经 ref 读取），因此传数组字面量也不会每次渲染都重置消息。
  `initialMessages` 保留为数组简写（`defaultMessages` 优先），向后兼容。
- **`setMessages(messages)`**：直接替换消息列表，不触发请求。
- **`isDefaultMessagesRequesting`**：异步历史加载态。
- **`clear()` 语义收紧**：复位到「最近一次解析出的默认消息」，而不是固定回到
  `initialMessages`——异步历史场景下这才符合预期。

### Fixed — 修掉请求收尾的两个竞态（切会话时才会暴露）

实现上面的能力时发现旧实现有两处共享状态导致的竞态，都已修复并补回归用例：

- **旧请求把新会话的 `loading` 按下去**：请求的 `finally` 原先无条件 `setLoading(false)`。
  切换会话会 abort 旧请求，而它的收尾是异步的——若此时新会话已发起请求，
  旧收尾会把新会话刚点亮的 loading 态清掉。现在改为**只在自己的 controller
  仍是当前请求时**才收尾。
- **旧请求误标新会话的 assistant 占位**：原先用「当前 assistant id」这个共享 ref
  定位消息，旧请求收尾时会读到新会话的 id。现在把 id **捕获在闭包里**按 id 更新，
  共享 ref 直接删除。

### Added — 多会话闭环 demo（`Conversations` + `Bubble.List` + `Sender` + `useXChat`）

- `bubble/demo/with-conversations.tsx`：一条完整链路——会话列表切换、每条会话
  独立的消息与流式回复、**新建 / 重命名 / 删除会话**、空会话用
  `Welcome` + `Prompts` 引导、删除最后一个会话时自动补一个空会话；
  会话内容以「异步读 + 写回」的模拟远端存储呈现。
  其中演示了多会话最容易踩的坑：**写回存储前必须判断这份消息属于哪个会话**
  （切会话瞬间 `messages` 仍是上一个会话的内容），示例用
  `defaultMessages` 解析时标记归属来解决。
- `use-x-chat/demo/conversation-key.tsx`：Hook 层面的最小示例——切 key 加载历史、
  `setMessages` 直接替换。
- 文档：`use-x-chat` 页新增 `conversationKey` 小节与 API 表更新，并写明
  「写回判归属 / 在途请求收尾」两个坑；`Bubble` 页新增「多会话闭环」小节；
  `Conversations` 页加入口链接；`llms.txt` 同步。

### Changed — `MarkdownContent` 的围栏代码块接入 `CodeHighlighter`（默认高亮）

补齐 antdx 里「XMarkdown + CodeHighlighter」的组合：Markdown 中的围栏代码块
不再只是纯文本，而是语法着色 + 语言标识 + 一键复制。

- **API 扩展**（`MarkdownContent`）：
  - `highlightCode?: boolean`（默认 `true`）——`false` 回到朴素的 `pre > code`；
  - `renderCode?: (info: { lang: string; code: string }) => ReactNode`——
    完全自定义，优先级高于 `highlightCode`。
- **实现要点一：覆写的是 `pre` 而不是 `code`。** 围栏代码块在 hast 里是
  `pre > code`；若在 `code` 渲染器里返回 `CodeHighlighter`（根节点是 `div`），
  就会形成 `<pre><div>` 这种非法嵌套。因此改为覆写 `pre`、直接从子元素读
  `language-xxx` 类名，那层 `code` 也就不再渲染——既拿到语言，也绕开了
  非法嵌套。（行内代码仍走 `code`，样式不受影响。）
- **实现要点二：去掉一个尾随换行。** react-markdown 传入的代码内容带 `\n`，
  留着会让代码块末尾多出一条空白行（单行代码渲染成 2 行）。
- **安全模型不变**：代码始终作为**文本**渲染，高亮只改观感、从不执行；
  新增用例断言「高亮后代码块内的 `<img onerror>` 仍不产生元素」。
- 测试从 6 个用例扩到 12 个，新增：默认高亮（含结构断言
  `.aura-x-markdown > .aura-x-code-highlighter`，即中间那层 `pre` 确已移除）、
  行内代码不受影响、`highlightCode={false}` 回归朴素形态、无语言标识按 `text`、
  `renderCode` 优先级、尾随换行不产生空白行。
- 文档：`markdown-content` 页新增「代码块的三种形态」demo（默认高亮 /
  关回朴素 / 完全自定义）与两条实现说明；`CodeHighlighter` 页的「何时使用」
  改为说明它已被 Markdown 默认接入；`llms.txt` 同步。

### Added — `@aura-react-comp/x` M8：补齐 antdx 剩余 5 个组件（官方组件全量覆盖）

至此 `@ant-design/x` 官方总览页的 17 个组件 / API 在本库**全部实现**，
「对标 Ant Design X」覆盖表清零：

- **`Sources`**（来源引用）：头部摘要（缺省「已引用 N 个来源」）+ 有序列表，
  `expandIconPosition`、`defaultExpanded` / `expanded` / `onExpand`、`onClick`；
  `inline` 模式渲染上标序号，悬停 / 聚焦浮出来源详情。空列表渲染 `null`，
  无 `url` 且无 `onClick` 时退化为纯文本（不产生无效的可点击元素）。
  浮层是组件内自绘的绝对定位面板而非 portal，不与页面弹窗抢 `z-index`。
- **`CodeHighlighter`**（代码高亮）：基于 `prism-react-renderer`，
  `lang` + `children` + `header`（默认头部含语言标识与一键复制），
  `ref.nativeElement`。复制优先 Clipboard API，非安全上下文自动回退
  `textarea` + `execCommand`。**配色写成 `var(--aura-*)` 令牌**而非固定主题对象，
  于是亮暗主题自动跟随——这是相对 antdx `highlightProps` 的刻意取舍。
- **`Mermaid`**（图表）：mermaid 源码 → SVG，图片 / 代码双视图、放大 / 缩小 /
  重置、下载 SVG、复制源码，`actions` 可逐项开关、`customActions` 可扩展。
  mermaid **动态 `import()` 按需加载**（可选 peer 依赖），未安装时不拖累主包，
  只在真正渲染时报错并给出安装提示；语法错误时展示错误详情而非白屏。
- **`Folder`**（文件树）：`treeData` 层级树 + 文件预览，展开 / 收起、选中、
  右键菜单（antd `Dropdown`，支持全局与节点级配置）、图标定制
  （`directory` 键 + 扩展名键）、`fileContentService` 异步拉取内容、
  `emptyRender` / `previewRender` / `previewTitle` / `directoryTitle` 定制。
  `ref` 暴露 `getNode` / `updateNode` / `deleteNode` / `addNode` 四个
  **不可变换算**方法（返回新 treeData，不改 props）。键盘支持
  `Enter` / `Space` 激活与 `←` / `→` 展开收起。
- **`XNotification` / `useNotification`**（系统通知）：`window.Notification` 的
  命令式封装——`permission` / `requestPermission` / `open` / `close`，以及
  返回 `[{ permission }, { open, close, requestPermission }]` 的 Hook。
  原生构造函数**调用时**才取，模块本身可安全 SSR import；`permission` 首帧固定
  `'denied'` 以避免水合不一致。`open` 同时接受 antdx 风格的 `{ openConfig, closeConfig }`。
- **依赖**：新增 `prism-react-renderer`（`dependencies`）与 `mermaid`
  （可选 `peerDependencies` + `peerDependenciesMeta.optional`，
  `devDependencies` 里同样声明以供文档站与测试使用）。
  新增组件会抬高 x 包体积，`size-limit` 的 `x` 预算按实测同步调整。
- **测试**：5 个组件共 **72 个用例**（Sources 14 / XNotification 16 /
  CodeHighlighter 11 / Mermaid 13 / Folder 18），均覆盖正常 / 边界 / 异常，
  视觉组件带 axe 无障碍基线。
- **文档**：`src/index.md` 组件总览表与「对标 Ant Design X」覆盖表更新，
  并写明三处刻意取舍（高亮配色走令牌、Mermaid 类型不硬依赖 mermaid、
  Notification 是系统通知）；`public/llms.txt` 补齐 5 个组件条目。

### Added — `@aura-react-comp/x` M7：Attachments / FileCard / ThoughtChain 接入包导出

补齐三个已写完源码、却**从未接入包导出**的 AI 组件，并修掉随之暴露的令牌命名问题：

- **`Attachments`**：输入框上方的附件条——`FileCard` 列表化排布，
  `onRemove(item, index)` 回传被移除项与索引，`overflow: wrap | scrollX` 两种溢出模式，
  空列表可选 `empty` 占位（缺省渲染 `null`）；语义为 `role="list"` / `listitem`。
- **`FileCard`**：附件与引用文件的基本展示单元——`status: init | uploading | done | error`
  四态、`percent` 进度条（越界自动钳制、`role="progressbar"` + aria-valuenow）、
  `errorTip` 失败原因、扩展名徽标与移除按钮；`formatFileSize` / `getFileExt`
  作为命名导出可直接复用。
- **`ThoughtChain`**：时间线形态的多步思维链——四态节点（pending / thinking / success /
  error）、折叠为一行摘要（文案由状态自动推导：进行中 / 已完成 / 含有失败步骤 / 共 N 步），
  存在 `thinking` 步骤时强制展开且头部禁用，全部结束后回到用户控制的折叠态。
  与 `Think` 的分工：Think 是单段思考文本的折叠面板，ThoughtChain 是多步骤时间线。
- **包导出补齐**：三者及其类型（`AttachmentItem` / `FileCardProps` / `FileCardStatus` /
  `ThoughtChainProps` / `ThoughtChainItem` / `ThoughtChainStatus`）加入 `src/index.ts`，
  顺序按「交互 → 推理」与其余组件对齐。此前 docs demo 直接
  `import { Attachments } from '@aura-react-comp/x'` 因缺导出导致 `tsc --noEmit` 报
  5 个 TS2305 / TS7006 —— `pnpm verify` 的类型门禁是红的。
- **补建 ThoughtChain demo 与测试**：`thought-chain/index.md` 引用了
  `./demo/basic.tsx` 与 `./demo/collapsible.tsx`，但该组件的 demo 目录与
  `index.test.tsx` **均不存在**（文档页会渲染失败、测试约定缺位）。本次补齐
  2 个 demo（静态四态混排 / 推理过程推进与折叠回看）与 10 个用例
  （正常 3 / 边界 5 / 异常 1 / a11y 1）。
- **文档同步**：`src/index.md` 组件总览表补入三个组件，并新增「对标 Ant Design X」
  覆盖情况表（12 个已实现、5 个待补：Notification、Sources、CodeHighlighter、
  Folder、Mermaid）；`public/llms.txt` 的 AI 组件清单此前停留在 M4，
  本次一并补上 `Actions` / `Conversations` / `Attachments` / `FileCard` / `ThoughtChain`。
- **`Sender` × `Attachments` 集成示例**：antdx 中 Attachments 的定位就是 Sender 的
  `header`，但此前 Sender 的插槽 demo 只用一段纯文本占位（「📎 附件条插槽：…」）。
  新增 `sender/demo/attachments.tsx`（附件条 + 单行横滑 + 发送后清空 + 字数统计），
  并在 Attachments 文档补一条组合注意事项：列表为空时应传 `undefined` 而非空数组，
  否则 Sender 会渲染出一条空的带内边距插槽容器。

### Fixed — `@aura-react-comp/x` 字号令牌命名不匹配（9 个样式文件的字号静默失效）

- 9 个 `.less`（actions / bubble / conversations / markdown-content / prompts / sender /
  suggestion / think / welcome）把字号令牌写成 `var(--aura-fontSize-*)`，而
  `tokens.css` 的真实定义是 kebab-case 的 `--aura-font-size-*`。变量未命中时
  `font-size` 整条声明被丢弃，这些组件的字号**长期静默回退到继承值**——
  表现为「标题不够大、辅助文字不够小」，且无任何报错。
- 修复后做全仓令牌审计（x 包 41 个在用令牌 × `tokens.css` 84 个定义）：
  「使用但未定义」的令牌为 **0**，无同类残留。
- 注意 `esm/` 是构建产物（`.gitignore` 已忽略），本次只改了 `src/`，需重新
  `pnpm --filter @aura-react-comp/x build` 才刷新 `esm/style.css` 与各 `esm/**/index.less`
  （改前产物中仍残留 16 处旧令牌名）。

### Fixed — 交付门禁漏掉第 8 个包 `@aura-react-comp/x`（三处硬编码清单同步）

`@aura-react-comp/x` 加入 workspace 时，三份**手写的包清单**都没有同步，导致整个 AI 组件包
在交付链路上是「免检」状态。三处一并改为按 `packages/*/package.json` 的
`scripts.build` 自动派生（判据：是否用 father 构建），新增包不会再漏：

- **`scripts/postbuild-dts.mjs` 的 `PACKAGES`**：漏掉 `x` 后，它的 12 个 `.d.ts`
  一直带着 `import './index.less'`。这正是该脚本存在的唯一理由——消费方在
  `skipLibCheck: false` 下会逐文件报 `TS2882: Cannot find module or type
declarations for side-effect import of './index.less'`。修复后单次构建的
  清理量从 46 个声明文件升至 **58 个**。
- **`scripts/smoke.mjs` 的 `LIB_PACKAGES`**：`@aura-react-comp/x` 的 9 项产物校验**全部空转**
  ——包括它的 `./style.css` 子路径是否真的存在、产物中相对引用是否可解析、
  裸包名依赖是否已声明。扩到 `x` 后立刻抓出下一个问题（见下条）。
- **`package.json` 的 `size-limit`**：8 个包只给 4 个设了体积预算。补 `x` 的预算
  （当时实测 15.53 kB，先设 20 kB；M8 新增 5 个组件后实测升至 28.35 kB，
  预算同步调整为 34 kB）。
- 两个脚本都加了「推导结果为空则报错退出」的兜底，避免清单推导失败时**静默跳过**
  全部校验（fail-open）。

### Fixed — `@aura-react-comp/x` 的 `react-markdown` 依赖声明与事实不符

- 扩大 smoke 覆盖后立刻暴露：`react-markdown` 只写在 `devDependencies`，
  但它被 `MarkdownContent` **静态**引入、又随包入口 re-export，属于消费方
  必须能解析的运行时依赖——未声明的后果是消费方 `import { Sender } from '@aura-react-comp/x'`
  时打包器直接报模块找不到。
- **最终处理：放进 `dependencies`**（`^10.1.0`），与 `@aura-react-comp/business` 处理
  `pdfjs-dist` 同款。曾短暂改为 `peerDependencies`，但那只是把「必装」的
  事实换成了一句安装警告，消费方仍要自己装；既然是静态导入、又随入口暴露，
  声明成运行时依赖才是诚实且零摩擦的做法。
- 同步订正措辞：`markdown-content` 文档页与 `src` 的 JSDoc、`llms.txt`
  此前称其为「**可选** peer 依赖」，但静态导入下并非真正可选。
  现在明确区分两件事：**组件**（`MarkdownContent`）是可选的
  （不传 `contentRender` 时 `Bubble` 走纯文本），**依赖**是必需的，
  并写清缘由（入口统一 re-export + 静态 import）。

### Changed — 文档站界面定稿（侧栏 / 目录 / 源码块 / 死代码清理）

- **侧栏菜单**：项高 48px → **40px**；hover 文本右移（`padding-left` 14→20px）纳入
  0.25s `cubic-bezier(0.4, 0, 0.2, 1)` 过渡——此前位移属性不在 transition 列表导致瞬间跳变，
  rAF 逐帧采样验证 16 帧平滑插值。分组标题下方新增品牌色渐变淡出线
  （透明 → 紫 32% → 透明），组标题呈现「标签 + 下划线」形态，分组归属一目了然。
- **右侧目录激活态**：改回 dumi 原生竖线样式，仅把指示线与文字换成主题紫
  （亮 `#7c3aed` / 暗 `#a78bfa`，替代 dumi 默认蓝 `#1677ff`）——与左侧菜单的
  极光渐变胶囊拉开视觉权重，主次分明。根因修复：此前 global.css 的
  `.dumi-default-toc > a` 系列选择器与真实 DOM（`> li > a`）不匹配从未生效，
  dumi 默认蓝线一直裸奔，本次一并清理收敛。
- **修复 demo 源码块圆角断裂**：源码容器 `.dumi-default-source-code` 自带
  `0 0 4px 4px` 圆角，套在 12px 圆角卡片底部形成双层圆角错位缺角；改为
  `.dumi-default-previewer .dumi-default-source-code { border-radius: 0 0 11px 11px;
overflow: hidden; }`（11 = 卡片 12 − 边框 1）。该类在页顶独立代码块上也复用，
  规则以 `.dumi-default-previewer` 前缀限定作用域，独立块保持 dumi 原样。
- **死代码清理 38 处**：以「全站 6 类页面 × 亮暗双模式 CDP 选择器匹配」找出零命中规则——
  dumi 1 时代 `.dumi-default-doc-content` 全家族 29 处（实际容器是 `.markdown`，
  原文件均为成对选择器，删死留活）、结构上不可能命中的 `[data-prefers-color="dark"] html`、
  侧栏清零规则里永不匹配的 `ul / li` 选择器、过时墓碑注释 6 条；
  `.dumi/global.css` 1400+ 行 → 1325 行，花括号平衡、回归计算样式全部通过，
  页面渲染零变化。previewer / tabs / search 等仅在交互态渲染的主题组件样式刻意保留。

### Added — 新包 `@aura-react-comp/x`（AI 组件库，M1 脚手架）

- 第 8 个包 `@aura-react-comp/x`：Aura 生态的 AI 对话组件库，对标 `@ant-design/x`。
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
- **M6 功能完善（参考 antd X）**：
  - **`Actions`**：消息操作组——复制 / 重新生成 / 点赞 / 删除；
    `role="toolbar"` 语义、danger / active / disabled 态、纵向排列；
  - **`Conversations`**：会话管理列表——激活高亮、时间戳、可配置操作菜单
    （重命名 / 删除，菜单点击自动关闭、点外部收起）；
  - **`Sender` 增强**：`submitType`（enter / shiftEnter 两种提交键位）、
    `autoSize`（textarea 行数范围透传）、`header` / `footer` 插槽；
  - 文档站新增 Actions / Conversations 两页（含 demo）。
- **文档站界面精修**：侧栏加宽至 240px、去除分组割裂横线、滚动条细化且按需出现；
  右侧目录收窄至 148px、标题中文化为「目录」、激活竖线改用主题色。
- **文档站侧栏分组**：AI 组件按 RICH 阶段分为「主题桥接 / 数据流 / 交互 / 反馈 /
  会话 / 引导 / 推理」七组（嵌套 `group.order` frontmatter 驱动，dumi 自动生成）。
- **`@aura-react-comp/icons` 收录新图标**：`ThumbUp` / `ThumbDown`（描边风格，与 action 组一致）；
  Actions demo 接入 `Copy` / `Refresh` / `ThumbUp` / `Delete` 四枚图标。
- **M5 打包修复与真机验证**：
  - **样式打包缺口修复**：组件内 `.less` 导入会让无 less 管线的消费方构建失败
    （Next.js 实测）。新增构建后处理 `scripts/build-styles.mjs`——把全部 less
    编译合并为 `esm/style.css`（新增 exports `./style.css`），并从 esm 中剥离
    `.less` 导入；消费方一次性 `import '@aura-react-comp/x/style.css'` 即可；
  - **真实消费方验证**：以本地 tarball（模拟发布产物）接入 Next.js 14 应用
    （AIChat Pro），新增 `/x` 试点页——XProvider + Bubble.List + Sender +
    useXChat 复用该应用既有的 streamChat 传输层，流式打字机对话完整可用，
    零运行时异常（Chrome 152 + 静态导出实测）；
  - **视觉升级**：全组件玻璃拟态 + 品牌渐变 + 光晕聚焦（详见前述设计说明与
    令牌扩充），`prefers-reduced-motion` 下关闭动效；
  - llms.txt 补齐业务组件与 @aura-react-comp/x 的 AI 摘要（含最小示例与环境要求）。
- **文档与 demo 补全**：新增 7 个可交互 demo——XProvider 主色即时切换、
  useXStream 的 SSE 实况解析（Blob URL 模拟服务端）、useXChat 消息状态机可视化、
  Bubble 变体矩阵 / 插槽组合、Sender 键位与插槽、Prompts 排列方向；
  XProvider 页新增 RICH 交互范式的组件总览表。
- **重构**：Aura 令牌 → antd token 的映射收敛到 `@aura-react-comp/shared` 的
  `antdTokenOverrides()`（纯数据，零 antd 依赖），`BusinessProvider` 同步改用，
  消除与 `@aura-react-comp/x` 之间的映射重复。

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
- **`@aura-react-comp/business` README 漏列 `PdfViewer`**：组件总览仍写「8 个」，
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
  复测 `@aura-react-comp/business` 硬编码色值 **0** 处、`!important` **0** 处。
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

  | 组件            | index.tsx    | utils.ts                                       |
  | --------------- | ------------ | ---------------------------------------------- |
  | `WeekTimeRange` | 475 → 385 行 | 时间解析 / 槽位生成 / 区间合并与裁剪（137 行） |
  | `YearCalendar`  | 435 → 360 行 | 全年周网格构建与日期格式化（92 行）            |
  | `CascaderPanel` | 389 → 273 行 | 级联树的勾选展开、聚合与状态重算（131 行）     |

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

- **恢复 `@aura-react-comp/business` 的声明文件产出**。`cascader-panel` 中两处把 `string[]` 传入
  期望 `ReadonlySet<string>` 的形参，导致 `father build` 在声明生成阶段抛出 `TS2345`，
  `esm/` 下 `.d.ts` 数量为 0。现已先行 `new Set(...)` 归一化。
- **移除 `@aura-react-comp/ui` 与 `@aura-react-comp/business` 的 `esm.alias` 配置**。father 的 bundless 模式会把被
  alias 命中的裸包名改写成仓库内相对路径（`@aura-react-comp/shared` → `../../../shared/src`），
  该路径在发布后的 `node_modules` 中并不存在，等于产物对下游完全不可用。
  移除后跨包导入保持裸包名，由使用方的包管理器解析。
- **打通 `@aura-react-comp/business` 的主题令牌链路**。该包全部 `.less` 使用 `var(--aura-*)` 且不设
  fallback，但未声明令牌提供方依赖；现声明 `@aura-react-comp/ui` 为依赖，并在入口引入
  `@aura-react-comp/ui/style.css`，使单独安装 `@aura-react-comp/business` 也能正确渲染。
- **修正包导出协议**（`shared` / `request` / `icons` / `ui` / `business`）：
  `exports` 条件改为 `types` 优先（原顺序不符合 TypeScript 规范，`node16` / `nodenext`
  解析下会失败）；补齐 `main` 字段（此前缺失，CJS 与旧版打包器无法解析）；
  补齐 `"type": "module"` 与 ESM 产物保持一致。
- **补全 `sideEffects`**：`ui` / `business` 增加 `**/*.css`，避免主题令牌被 tree-shaking 误摇除。
- **修正文档中的错误引入路径**。`quick-start` 原先教用户 `import '@aura-react-comp/ui/src/theme/tokens.css'`，
  但发布包只含 `esm/`，该路径必然报 `Module not found`；现改为 `@aura-react-comp/ui/style.css`。
- **`@aura-react-comp/cli` 补齐 `files` 字段**，避免发布时夹带源码与配置。

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
- `@aura-react-comp/ui` 的 `files` 移除不存在的 `dist`。
- `@aura-react-comp/skill` 明确标注为「非代码包」，补充说明其提示词资产性质。

---

## [0.0.1] — 初始版本

- Aura Monorepo 初始化：`shared` / `request` / `icons` / `ui` / `business` / `cli` / `skill`。
- 基于 dumi 2 的文档站，支持 GitHub Pages 自动部署。
