---
title: 发布流程
description: Aura 组件库的 npm 发布流程：本地直接发布、CI 自动发布、dist-tag 与 beta 周期、失败排查
order: 9
toc: content
---

# 发布流程

Aura 用 [changesets](https://github.com/changesets/changesets) 管理版本：
**变动以 changeset 提交，版本号由 changesets 推导**。发布可以分为两条路——
**本地直接发布**（最快，适合首次与救火）和 **CI 自动发布**（适合日常）。

链路设计与 [aura-vue](https://asbeforelandy.github.io/aura-vue/guide/release) 保持一致，
那套流程已实战验证。

## 一、发布拓扑

一期发布 **6 个包**，pnpm 的递归发布会按工作区依赖图**拓扑排序**，叶子包在前：

```
@aura-react-comp/shared
  ├─ @aura-react-comp/request
  ├─ @aura-react-comp/icons
  └─ @aura-react-comp/ui            ← 依赖 icons / shared
       └─ @aura-react-comp/business ← 依赖 ui / shared
@aura-react-comp/x                  ← 依赖 shared
```

`@aura-react-comp/cli` 与 `@aura-react-comp/skill` 是 `private`，不参与发布。

`workspace:*` 协议会在发布时被自动替换为真实版本号，**不要手改**各包的
`dependencies`。

## 二、dist-tag 约定

| npm tag  | 用途                             | 安装方式                         |
| -------- | -------------------------------- | -------------------------------- |
| `latest` | 正式版（默认）                   | `npm i @aura-react-comp/ui`      |
| `beta`   | 预发布版（不稳定，API 可能变动） | `npm i @aura-react-comp/ui@beta` |

`latest` 始终指向最新的**正式版**——beta 不会影响普通用户的安装结果。

## 三、本地直接发布

适合：**首次发布**、救火、CI 不可用时。全程在本机完成。

### 0. 前置

在 `~/.npmrc` 写入 Granular Access Token（**不要写进仓库的 `.npmrc`**）：

```bash
npm config set //registry.npmjs.org/:_authToken=你的token
npm whoami   # 应输出你的 npm 用户名
```

Token 必须是 **Granular Access Token** 且勾选 **Bypass 2FA**：

- classic / automation token 已下线；
- 权限范围选 **All Packages + Read and write**——「Only select packages」
  选不到**尚不存在**的新包；
- 不勾 Bypass 2FA 会报 `Two-factor authentication or granular access token
with bypass 2fa enabled is required`，这条错误长得很像权限问题，容易误诊。

### 1. 门禁与预演

```bash
pnpm verify                                # 唯一门禁，必须全绿

pnpm -r publish --dry-run --no-git-checks  # 只看打包结果，不写入 registry
```

每个包的 tarball 应只含 `esm/`、`README.md`、`package.json`、`LICENSE`。
若出现 `src/` 或测试文件，说明 `files` 白名单被改动过。

### 2. 首次发布（6 个包尚未在 npm 上）

全新包名无法绑定 Trusted Publisher（npm 要求包**先存在**），所以第一次必须
由维护者用 token 发。用 pnpm 原生发布——它按拓扑序发、自动解析 `workspace:*`，
且明确支持全新包：

```bash
pnpm -r publish --no-git-checks
```

想更稳可以先只发一个依赖最少的包验证权限：

```bash
pnpm --filter @aura-react-comp/shared publish --no-git-checks
npm view @aura-react-comp/shared version      # 应回显 0.1.0
```

确认无误后再发其余 5 个：

```bash
pnpm -r --filter '!@aura-react-comp/shared' publish --no-git-checks
```

发完请**删除该 token**（npmjs.com → Access Tokens）。

### 3. 日常发布

```bash
pnpm changeset      # ① 交互式：选受影响的包 + 版本类型 + 写变更说明
git add .changeset  #    与实现一起提交
pnpm release        # ② = pnpm build:lib && changeset publish
```

`pnpm release` 会先构建全部产物，再由 changesets 推导版本、改写各包
`CHANGELOG.md`、发布并打 git tag。执行前请确保**工作区已提交干净**——
changesets 会检查 git 状态。

## 四、CI 自动发布

`.github/workflows/release.yml` 在 **push 到 `master`** 时触发（也可在 Actions
页手动 dispatch）。它做四件事：

1. **Verify**：全量门禁，失败自动重试一次（共享 runner 偶发失败），日志落盘上传
2. **Version**：有 changeset 则消费它并提交回 master（`[skip ci]`）；无则跳过
3. **Publish**：发布到官方 registry（带 provenance 供应链声明）
4. **Tags**：推送发布 tag

**未配置 `NPM_TOKEN` secret 时整体跳过发布**，链路仍然跑得通、CI 不会红。

### 两条认证路径

| 路径                 | 配置                                                                                 | 适用                                  |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| **token**（当前）    | 仓库 Secrets 配 `NPM_TOKEN`                                                          | 首次发布后立刻可用；无需额外操作      |
| **OIDC**（可选升级） | 在 npm 上为每个包绑定 Trusted Publisher 后，**删掉** workflow 里的 `NODE_AUTH_TOKEN` | 更安全：无长寿命凭证、自动 provenance |

绑定 Trusted Publisher 时各字段填：

| 字段                 | 值                                                       |
| -------------------- | -------------------------------------------------------- |
| Organization or user | `AsBeforeLandy`                                          |
| Repository           | `aura`                                                   |
| Workflow filename    | `release.yml`（**只写文件名**，须含 `.yml`，大小写敏感） |
| Allowed actions      | **npm publish**                                          |

> **一个包同时只能绑定一个 Trusted Publisher**，6 个包要各绑一次，没有捷径。
> `id-token: write` 权限已经就位，切 OIDC 时无需再改权限。
>
> 另需注意：npm 计划从 **2027 年 1 月**起取消 bypass-2FA token 的直接发布能力，
> 所以 OIDC 不是可选的优化，而是有明确时间表的迁移。

## 五、Beta 发布（pre 模式）

beta 周期用 changesets 的 **pre 模式**驱动，npm dist-tag 由 changesets 自动
切换为 `beta`，无需额外参数：

```bash
# ① 进入 beta 周期（提交 .changeset/pre.json）
pnpm changeset pre enter beta

# ② 照常添加 changeset、合并代码
pnpm changeset            # 例：minor —— beta 里体现为 0.2.0-beta.0

# ③ 每次发布产出 0.2.0-beta.1、0.2.0-beta.2 …（tag=beta）

# ④ beta 验证完毕，退出 pre 模式
pnpm changeset pre exit
# ⑤ 下一次 version 消费剩余 changeset，发布 0.2.0 正式版（tag=latest）
```

| 阶段         | 版本形态                            | npm tag  |
| ------------ | ----------------------------------- | -------- |
| 稳定周期     | `0.1.0` → `0.2.0`                   | `latest` |
| beta 周期内  | `0.2.0-beta.0` → `0.2.0-beta.1` → … | `beta`   |
| 退出 beta 后 | `0.2.0`                             | `latest` |

> beta 期间**不要把 `latest` 手动指向 beta**；正式版发布后 `latest` 会自动切回。
> 安装 beta 的用户需显式使用 `@beta` 后缀，npm 不会自动升级到 beta。

## 六、手动操作速查

```bash
pnpm changeset            # 添加一条变更记录
pnpm changeset status     # 查看待发布的变更
pnpm changeset version    # 本地预览版本推导（会改写 package.json 与 CHANGELOG）
pnpm changeset publish    # 手动发布（会发所有 registry 上不存在的版本）
pnpm release              # 构建 + 发布（日常用这个）
pnpm -r publish --dry-run # 只看打包结果
```

**不要做的事**：不要手改 `packages/*/package.json` 的 `version`，也不要手写
`packages/*/CHANGELOG.md`——这两件事都由 `changeset version` 统一产出，
手改会与 changeset 记录脱节。

## 七、失败排查

| 症状                                      | 多半的原因                                             | 处理                                    |
| ----------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| 403 Forbidden，无 2FA 字样                | scope 与 npm 组织名不一致，或账号无该组织发布权限      | `npm whoami`；确认包名 scope 等于组织名 |
| 403 且提到 `bypass 2fa enabled`           | token 未勾选 Bypass 2FA                                | 重建 token                              |
| 402 Payment Required                      | 缺 `access: public`，npm 试图按私有包发布              | 检查各包 `publishConfig.access`         |
| 401 `ENEEDAUTH`                           | workflow 缺 `registry-url`，或本地未登录               | 补 `registry-url` / `npm whoami`        |
| 404 Not Found (PUT)                       | scope 与组织名不匹配；或 OIDC 的 workflow 文件名不匹配 | 逐字核对                                |
| E422                                      | `package.json#repository.url` 与 GitHub 仓库不一致     | 核对 `repository` 字段                  |
| `Cannot publish with uncommitted changes` | 本地发布前工作区是脏的                                 | 先提交，再 `pnpm release`               |
| 版本已存在                                | changesets 不会重复发布已存在的版本                    | 先加 changeset 提升版本                 |
| `ERR_PNPM_OUTDATED_LOCKFILE`              | 改了 `package.json` 但未更新 lockfile                  | `pnpm install --ignore-scripts` 并提交  |

## 八、二期包

`@aura-react-comp/cli` 与 `@aura-react-comp/skill` 目前是 `private`。纳入发布时需要：

1. 移除 `packages/<name>/package.json` 的 `private`；
2. 改写 README 中「内部工具，尚未发布」的口径；
3. `cli` 需先验证其 MCP server 在干净环境中可用；
4. 走一次「三、本地直接发布」的首次流程。

`scripts/sync-license.mjs` 按 `private` 字段**自动派生**待发布包清单，
所以移除 `private` 后它们会被自动纳入，不需要维护第二份清单。

## 延伸阅读

- [工程化工具链](/guide/toolchain)：发布在整套门禁中的位置
- [安装](/guide/installation)：作为使用方如何引入样式与令牌
