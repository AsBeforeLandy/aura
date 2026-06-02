---
name: create-icons-package
overview: 创建 `@aura/icons` 图标库 package，设计包含 60+ 常用图标的完整图标系统，并将 `@aura/ui` 中所有内联 SVG 替换为从 `@aura/icons` 导入。
todos:
  - id: create-icons-package
    content: 创建 icons 包基础结构：package.json、.fatherrc.ts、tsconfig.json，注册 pnpm workspace 依赖
    status: completed
  - id: define-icon-types
    content: 定义 IconProps 接口和 types.ts，实现 createIcon 工厂函数统一图标创建模式
    status: completed
    dependencies:
      - create-icons-package
  - id: implement-status-icons
    content: 实现 Status 分类图标：CheckCircle、CloseCircle、WarningTriangle、InfoCircle
    status: completed
    dependencies:
      - define-icon-types
  - id: implement-navigation-icons
    content: 实现 Navigation 分类图标：ChevronLeft/Right/Down/Up、ArrowLeft/Right/Up/Down
    status: completed
    dependencies:
      - define-icon-types
  - id: implement-action-icons
    content: 实现 Action 分类图标：Close、Plus、Minus、Search、Edit、Delete、Copy、Refresh、Upload、CloudUpload、EyeOpen、EyeClosed、Menu、MoreHorizontal、MoreVertical
    status: completed
    dependencies:
      - define-icon-types
  - id: implement-star-file-general-icons
    content: 实现 Star/File/General 分类图标：StarFilled/Half/Empty、File、Folder、FolderOpen、PicturePlaceholder、Home、User、Settings、Mail、Phone、Calendar、Clock、Bell、BellOff、Lock、Link、Loading
    status: completed
    dependencies:
      - define-icon-types
  - id: implement-result-empty-icons
    content: 实现 Result/Empty 分类大插图图标：ResultSuccess/Error/Warning/Info、NotFound、Forbidden、ServerError、EmptyDefault、Empty404
    status: completed
    dependencies:
      - define-icon-types
  - id: setup-barrel-exports-docs
    content: 配置 barrel 统一导出 index.ts、创建图标库 dumi 文档页面、更新 .dumirc.ts 别名和根 build:lib 脚本
    status: completed
    dependencies:
      - implement-status-icons
      - implement-navigation-icons
      - implement-action-icons
      - implement-star-file-general-icons
      - implement-result-empty-icons
  - id: migrate-ui-components
    content: 迁移 UI 库 15 个组件：替换所有内联 SVG 为 @aura/icons 导入，添加 @aura/ui 对 @aura/icons 的依赖
    status: completed
    dependencies:
      - setup-barrel-exports-docs
  - id: verify-build
    content: 验证全量构建（icons + ui）、运行 lint 检查、确保 dumi dev 可正常启动且图标显示正确
    status: completed
    dependencies:
      - migrate-ui-components
  - id: 79f78aa1
    content: 图标默认为主题色，可自定义颜色大小
    status: completed
  - id: 1e1da4c6
    content: 图标分为线框风格、实底风格、双色风格
    status: completed
---

## 用户需求

新建 `icons` package，设计一套完整的 SVG 图标库，将 UI 库中所有内联 SVG 图标抽离为独立的图标组件，并替换 UI 库中所有图标引用。

## 产品概述

`@aura/icons` 是一个基于 React 的 SVG 图标组件库，作为 Aura 组件库体系的基础设施。每个图标封装为独立的 React 函数组件，支持统一的大小、颜色、类名等属性控制，按类别组织导出，天然支持 Tree Shaking。

## 核心功能

- **图标覆盖**：涵盖当前 UI 库中所有图标（约 32 个），并补充通用常用图标（方向箭头、操作按钮、状态标识、文件类型等），总计约 60+ 图标
- **统一接口**：所有图标组件接受一致的 Props（size、color、className、style），默认 `size=24`、`color="currentColor"`
- **分类管理**：按 Action（操作）、Navigation（导航）、Status（状态）、File（文件）、Editor（编辑）、Media（媒体）等类别组织
- **UI 库迁移**：将 15 个组件中的内联 SVG 替换为 `@aura/icons` 导入，消除重复定义
- **构建集成**：使用 father 构建 ESM 输出，接入 pnpm workspace 和 dumi 文档系统

## 技术栈

- **框架**：React 18 + TypeScript（与项目保持一致）
- **构建工具**：father 4.x（ESM 输出）
- **类型定义**：TypeScript 严格模式
- **包管理**：pnpm workspace 7.x

## 实现方案

### 核心设计策略

采用 **每个图标一个独立 React 组件** 的架构模式，而非单一大 SVG 雪碧图文件。理由：

1. **Tree Shaking 友好**：按需导入，不会引入未使用的图标
2. **类型安全**：每个图标作为独立组件，Props 类型可精确控制
3. **与现有模式一致**：项目使用 father ESM 构建，天然支持按需加载

### 图标组件接口设计

```typescript
export interface IconProps {
  /** 图标大小，默认 24 */
  size?: number;
  /** 图标颜色，默认 currentColor 继承父级 */
  color?: string;
  /** 附加 CSS 类名 */
  className?: string;
  /** 行内样式 */
  style?: React.CSSProperties;
}
```

每个图标组件内部：

- 使用 `<svg>` 标签，`width`/`height` 绑定 `size` prop
- `fill` 或 `stroke` 绑定 `color` prop，但预设默认值为 `"currentColor"`
- 通过 `className` 和 `style` 透传支持自定义样式
- 使用 `React.forwardRef` 支持 ref 转发

### SVG 设计规范

- **基准画布**：`viewBox="0 0 24 24"`（标准图标），大插图使用独立 viewBox
- **颜色继承**：所有路径 `fill="currentColor"` 或 `stroke="currentColor"`，确保通过 color prop 或父级 color CSS 控制颜色
- **风格统一**：2px 描边，圆角连接，实心面使用 fill，线性使用 stroke

### 图标分类规划

| 类别 | 图标 | 用途 |
| --- | --- | --- |
| Status | CheckCircle, CloseCircle, WarningTriangle, InfoCircle | 状态反馈 |
| Navigation | ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, ArrowUp, ArrowDown | 导航指引 |
| Action | Close, Plus, Minus, Search, Edit, Delete, Copy, Refresh, Upload, CloudUpload, EyeOpen, EyeClosed, Menu, MoreHorizontal, MoreVertical | 操作按钮 |
| Star | StarFilled, StarFilledHalf, StarEmpty | 评分 |
| File | File, Folder, FolderOpen, PicturePlaceholder | 文件类型 |
| Result | SuccessLarge, ErrorLarge, WarningLarge, InfoLarge, NotFound, Forbidden, ServerError | 结果页 |
| Empty | EmptyDefault, Empty404 | 空状态 |
| General | Home, User, Settings, Mail, Phone, Calendar, Clock, Bell, BellOff, Lock, Link, Loading | 通用 |


### 架构设计

```mermaid
flowchart LR
    subgraph "@aura/icons"
        I[icons/src/*.tsx]
        E[index.ts barrel exports]
        B[types.ts]
    end
    subgraph "@aura/ui"
        A[Alert]
        M[Message]
        N[Notification]
        I2[Input]
        U[Upload]
        P[Pagination]
        C[Collapse/Menu]
        R[Rate]
        S[Spin/Steps/Result/Empty/Tag/Layout]
    end
    I -->|father build| E
    E -->|@aura/icons import| A
    E -->|@aura/icons import| M
    E -->|@aura/icons import| N
    E -->|@aura/icons import| I2
    E -->|@aura/icons import| U
    E -->|@aura/icons import| P
    E -->|@aura/icons import| C
    E -->|@aura/icons import| R
    E -->|@aura/icons import| S
```

## 实现细节

### 目录结构

```
packages/icons/
├── package.json              # [NEW] 包配置，name: @aura/icons
├── .fatherrc.ts              # [NEW] father ESM 构建配置
├── tsconfig.json             # [NEW] TypeScript 配置
├── index.md                  # [NEW] 图标库文档首页
└── src/
    ├── index.ts              # [NEW] barrel 统一导出
    ├── types.ts              # [NEW] IconProps 接口定义
    ├── status/
    │   ├── CheckCircle.tsx   # [NEW] 成功勾选圆圈图标
    │   ├── CloseCircle.tsx   # [NEW] 错误叉号圆圈图标
    │   ├── WarningTriangle.tsx # [NEW] 警告三角图标
    │   ├── InfoCircle.tsx    # [NEW] 信息圆圈图标
    │   └── index.ts          # [NEW] status 分类导出
    ├── navigation/
    │   ├── ChevronLeft.tsx   # [NEW]
    │   ├── ChevronRight.tsx  # [NEW]
    │   ├── ChevronDown.tsx   # [NEW]
    │   ├── ChevronUp.tsx     # [NEW]
    │   ├── ArrowLeft.tsx     # [NEW]
    │   ├── ArrowRight.tsx    # [NEW]
    │   ├── ArrowUp.tsx       # [NEW]
    │   ├── ArrowDown.tsx     # [NEW]
    │   └── index.ts
    ├── action/
    │   ├── Close.tsx         # [NEW]
    │   ├── Plus.tsx          # [NEW]
    │   ├── Minus.tsx         # [NEW]
    │   ├── Search.tsx        # [NEW]
    │   ├── Edit.tsx          # [NEW]
    │   ├── Delete.tsx        # [NEW]
    │   ├── Copy.tsx          # [NEW]
    │   ├── Refresh.tsx       # [NEW]
    │   ├── Upload.tsx        # [NEW]
    │   ├── CloudUpload.tsx   # [NEW]
    │   ├── EyeOpen.tsx       # [NEW]
    │   ├── EyeClosed.tsx     # [NEW]
    │   ├── Menu.tsx          # [NEW]
    │   ├── MoreHorizontal.tsx # [NEW]
    │   ├── MoreVertical.tsx  # [NEW]
    │   └── index.ts
    ├── star/
    │   ├── StarFilled.tsx    # [NEW]
    │   ├── StarFilledHalf.tsx # [NEW]
    │   ├── StarEmpty.tsx     # [NEW]
    │   └── index.ts
    ├── file/
    │   ├── File.tsx          # [NEW]
    │   ├── Folder.tsx        # [NEW]
    │   ├── FolderOpen.tsx    # [NEW]
    │   ├── PicturePlaceholder.tsx # [NEW]
    │   └── index.ts
    ├── result/
    │   ├── ResultSuccess.tsx # [NEW] 72x72 大插图
    │   ├── ResultError.tsx   # [NEW]
    │   ├── ResultWarning.tsx # [NEW]
    │   ├── ResultInfo.tsx    # [NEW]
    │   ├── NotFound.tsx      # [NEW] 200x120
    │   ├── Forbidden.tsx     # [NEW]
    │   ├── ServerError.tsx   # [NEW]
    │   └── index.ts
    ├── empty/
    │   ├── EmptyDefault.tsx  # [NEW] 200x160
    │   ├── Empty404.tsx      # [NEW]
    │   └── index.ts
    └── general/
        ├── Home.tsx          # [NEW]
        ├── User.tsx          # [NEW]
        ├── Settings.tsx      # [NEW]
        ├── Mail.tsx          # [NEW]
        ├── Phone.tsx         # [NEW]
        ├── Calendar.tsx      # [NEW]
        ├── Clock.tsx         # [NEW]
        ├── Bell.tsx          # [NEW]
        ├── BellOff.tsx       # [NEW]
        ├── Lock.tsx          # [NEW]
        ├── Link.tsx          # [NEW]
        ├── Loading.tsx       # [NEW] 带动画旋转
        └── index.ts
```

### UI 库迁移映射

以 Alert 组件为例，内联 SVG 替换方式：

```
替换前（内联）：
const variantIcons = { success: <svg>...</svg>, ... }

替换后：
import { CheckCircle, CloseCircle, WarningTriangle, InfoCircle, Close } from '@aura/icons';
const variantIcons = { success: <CheckCircle size={16} />, ... }
```

被迁移的组件及替换对照：

- **Alert**：CheckCircle/CloseCircle/WarningTriangle/InfoCircle/Close
- **Message**：CheckCircle/CloseCircle/WarningTriangle/InfoCircle/Loading
- **Notification**：CheckCircle/CloseCircle/WarningTriangle/InfoCircle/Close
- **Input**：EyeOpen/EyeClosed/Search
- **Upload**：Upload/CloudUpload/CheckCircle/CloseCircle/PicturePlaceholder/Close
- **Pagination**：ChevronLeft/ChevronRight
- **Collapse**：ChevronDown
- **Menu**：ChevronDown
- **Rate**：StarFilled/StarFilledHalf/StarEmpty
- **Steps**：CheckCircle
- **Spin**：Loading
- **Result**：ResultSuccess/ResultError/ResultWarning/ResultInfo/NotFound/Forbidden/ServerError
- **Empty**：EmptyDefault/Empty404
- **Tag**：Close
- **Layout**：ChevronLeft

### 性能考虑

- 每个图标组件纯函数渲染，无副作用
- 使用 `React.forwardRef` 支持 ref 传递，避免额外包裹层
- barrel 导出确保 Tree Shaking 有效（father + ESM）
- Loading 动画使用 CSS keyframes，通过 className 注入，避免 JS 计时器

### 向后兼容

- 图标 Props 均为可选，默认提供合理值
- 保持与原内联 SVG 相同的 viewBox 和路径数据
- UI 组件中图标尺寸保持不变（16/14/72 等），仅替换来源