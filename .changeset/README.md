# Changesets

本目录用于记录「待发布的变更意图」，由 [changesets](https://github.com/changesets/changesets) 驱动。

## 日常流程

1. 改完代码后，在仓库根执行：

   ```bash
   pnpm changeset
   ```

   交互式选择**受影响的包**与**版本类型**（patch / minor / major），并写一段面向使用者的变更说明。

2. 生成的 `.changeset/<随机名>.md` 随实现一起提交、走 PR 评审。

3. PR 合并进 `master` 后，`release.yml` 会自动开/更新一个标题为
   `chore(release): version packages` 的 **Version Packages PR**——它只做两件事：
   按 changeset 累加各包版本号、生成各包的 `CHANGELOG.md`。

4. 合并那个 PR，即触发真正的发布（npm Trusted Publishing / OIDC）。

## 约定

- **不要手改 `packages/*/package.json` 的 `version`**，也不要手写 `CHANGELOG.md` ——
  这两件事都由 `changeset version` 统一产出，手改会与 changeset 记录脱节。
- 内部依赖（`@aura-react-comp/ui` 依赖 `@aura-react-comp/shared` 等）的版本范围由
  `updateInternalDependencies: "patch"` 自动联动，不需要手动改。
- 首批 6 个包（shared / request / icons / ui / business / x）**不设 `fixed` 组**，
  允许各自独立演进。
- 完整发布流程（含首次发布的特殊性）见 `docs/guide/releasing.md`。
