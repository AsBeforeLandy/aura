---
title: Folder
subtitle: 文件树
group:
  title: 交互
  order: 402
category: Components
description: 文件树 + 文件预览：展开收起、选中、右键菜单与图标定制，内容可内联或经 fileContentService 按需拉取，ref 提供不可变的增删改。
order: 18
demo:
  cols: 1
toc: content
---

# Folder 文件树

## 何时使用

- 展示代码仓库 / 技能目录等层级结构，并让用户点开某个文件查看内容；
- 智能体读取本地文件、生成多文件产物时的浏览界面。

## 代码演示

### 基本用法

<code src="./demo/basic.tsx" description="目录树 + 预览；点击文件夹展开，点击文件查看内容。">文件浏览</code>

### 受控选择与按需加载

<code src="./demo/controlled.tsx" description="selectedFile / expandedPaths 受控，内容由 fileContentService 异步拉取。">受控与懒加载</code>

## API

### FolderProps

| 参数                  | 说明                                                                           | 类型                                                                  | 默认值   |
| --------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------- |
| treeData              | 文件树数据                                                                     | `FolderTreeData[]`                                                    | `[]`     |
| selectable            | 是否开启选择                                                                   | `boolean`                                                             | `true`   |
| selectedFile          | 选中项的 path 数组（受控）                                                     | `string[]`                                                            | -        |
| defaultSelectedFile   | 默认选中项的 path 数组                                                         | `string[]`                                                            | `[]`     |
| onSelectedFileChange  | 选择变化回调                                                                   | `(file: { path: string[]; name?: string; content?: string }) => void` | -        |
| directoryTreeWith     | 目录树宽度                                                                     | `number \| string`                                                    | `278`    |
| expandedPaths         | 展开节点的 key 数组（受控）                                                    | `string[]`                                                            | -        |
| defaultExpandedPaths  | 默认展开节点的 key 数组                                                        | `string[]`                                                            | -        |
| defaultExpandAll      | 是否默认展开全部文件夹                                                         | `boolean`                                                             | `true`   |
| onExpandedPathsChange | 展开 / 收起变化回调                                                            | `(paths: string[]) => void`                                           | -        |
| fileContentService    | 文件内容服务（异步拉取）                                                       | `{ loadFileContent(filePath: string): Promise<string> }`              | -        |
| onFileClick           | 文件点击事件                                                                   | `(filePath: string, content?: string) => void`                        | -        |
| onFolderClick         | 文件夹点击事件                                                                 | `(folderPath: string) => void`                                        | -        |
| directoryTitle        | 目录树标题；`false` 不展示                                                     | `false \| ReactNode \| (() => ReactNode)`                             | `'文件'` |
| previewTitle          | 预览区标题；缺省用文件名                                                       | `string \| ((info) => ReactNode)`                                     | -        |
| previewRender         | 自定义预览内容                                                                 | `ReactNode \| ((file, info) => ReactNode)`                            | -        |
| emptyRender           | 空状态内容；覆盖「树为空」与「未选中」两处默认提示，`false` 不展示             | `false \| ReactNode \| (() => ReactNode)`                             | -        |
| directoryIcons        | 图标配置：`directory` 键对应文件夹，其余键按扩展名匹配文件；`false` 不展示图标 | `false \| Record<string, ReactNode \| (() => ReactNode)>`             | -        |
| contextMenu           | 右键菜单：全局配置或按节点返回                                                 | `MenuProps['items'] \| ((node, key) => MenuProps['items'])`           | -        |
| onRightClick          | 右键点击回调                                                                   | `({ event, node }) => void`                                           | -        |

### FolderTreeData

| 参数        | 说明                                               | 类型                                                           |
| ----------- | -------------------------------------------------- | -------------------------------------------------------------- |
| title       | 显示名称                                           | `string`                                                       |
| path        | 节点自身的路径标识，需在同级中唯一                 | `string`                                                       |
| content     | 文件内容；给了就不必再配 `fileContentService`      | `string`                                                       |
| children    | 子节点；有该字段即视为文件夹（空数组也算）         | `FolderTreeData[]`                                             |
| contextMenu | 该节点的右键菜单，优先级高于全局配置；`false` 禁用 | `MenuProps['items'] \| false \| ((key) => MenuProps['items'])` |

### FolderRef

| 方法       | 说明                                  | 类型                                              |
| ---------- | ------------------------------------- | ------------------------------------------------- |
| getNode    | 按路径取节点                          | `(path: string[]) => FolderTreeData \| undefined` |
| updateNode | 不可变更新：合并字段并返回新 treeData | `(path, data) => FolderTreeData[]`                |
| deleteNode | 不可变删除：返回新 treeData           | `(path) => FolderTreeData[]`                      |
| addNode    | 不可变新增：在目标文件夹下追加子节点  | `(parentPath, node) => FolderTreeData[]`          |

## 注意事项

- **`path` 是「节点自身的路径标识」，不是完整路径**。选中、展开、`ref.getNode`
  用的都是从根到该节点的 `path` 依次拼接成的数组，例如 `['src', 'utils', 'index.ts']`；
  `expandedPaths` 里的 key 则是该数组以 `/` 连接后的字符串（`'src/utils'`）。
- **有 `children` 字段即视为文件夹**（空数组也算空文件夹，仍可展开）；
  没有该字段就是文件。
- 点击文件夹会**同时**展开 / 收起并触发选择与 `onFolderClick`——
  单一交互面避免了「小箭头 + 行」两个热区带来的误操作，也让键盘可达性更简单。
- 键盘：`Enter` / `Space` 激活节点，`←` / `→` 收起 / 展开文件夹。
  完整的方向键漫游（`↑` / `↓` / `Home` / `End`）未实现。
- 树的增删改由 `ref` 上的**不可变**方法完成，它们返回新的 `treeData` 而不直接改 props；
  受控场景请把返回值写回你自己的 state。
- 预览内容的优先级：节点内联 `content` →`fileContentService` 拉取 → 空内容。
  两者都没有时预览区会显示为空白（不会报错）。
