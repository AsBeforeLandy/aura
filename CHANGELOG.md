# Changelog

本文件记录 Aura 仓库的重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

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

### 待决策（已知的未实现 prop）

以下 prop 已在类型与文档中声明但从未生效，属功能缺口而非风格问题，需产品侧决定「实现」或「从类型中移除」：

| 组件 | prop | 现状 |
| --- | --- | --- |
| `Upload` | `action`、`headers` | JSDoc 标注为「模拟使用」，为对齐 antd API 保留的占位；组件本身只做本地选择，不发请求 |
| `Dragger` | `children` | 已声明未使用 |
| `Menu` | `subKey` | 声明为必填「唯一标识」但未被使用 |
| `Menu` | `collapsible` | 已声明未使用（折叠菜单未实现） |
| `Input.Search` | `searchButtonText` | 已声明未使用（自定义按钮文案未实现） |

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
- 新增 `packages/icons/src/index.md`，修复文档站 `/components/icons` 死链
  （侧边栏有入口但无文档文件）。
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
