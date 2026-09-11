# Changelog

本文件记录 Aura 仓库的重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

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
