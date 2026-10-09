---
title: Select
subtitle: 选择器
group: 表单
category: Components
description: 下拉选择器，支持搜索、多选等。
order: 2
demo:
  cols: 2
toc: content
---

# Select 选择器

下拉选择器，支持搜索、多选等。

```tsx | pure
import { Select } from '@aura-react-comp/ui';
```

## 何时使用

- 弹出一个下拉菜单供用户选择操作
- 需要从一组数据中选择一个或多个选项时

## 代码演示

<code src="./demo/basic.tsx" description="最基本的单选用法。">基本用法</code>
<code src="./demo/variant.tsx" description="提供 `default`、`filled`、`bordered` 三种变体样式。">变体样式</code>
<code src="./demo/size.tsx" description="提供 `sm`、`md`、`lg` 三种尺寸。">尺寸</code>
<code src="./demo/controlled.tsx" description="通过 `value` + `onChange` 受控使用，或通过 `defaultValue` 非受控使用。">受控与非受控</code>
<code src="./demo/multiple.tsx" description="设置 `multiple` 属性开启多选模式。">多选模式</code>
<code src="./demo/search.tsx" description="设置 `searchable` 属性开启搜索过滤功能。">可搜索</code>
<code src="./demo/clearable.tsx" description="设置 `clearable` 属性，选中后显示清除按钮。">可清除</code>
<code src="./demo/disabled.tsx" description="支持整个组件禁用，也支持单个选项禁用。">禁用</code>
<code src="./demo/loading.tsx" description="设置 `loading` 属性显示加载状态。">加载中</code>
<code src="./demo/label-in-value.tsx" description="`labelInValue` 取值携带 label；`maxTagCount` 多选超出收敛为 `+N...`。">取值带 label 与标签收敛</code>
<code src="./demo/remote-search.tsx" description="`filterOption={false}` 关闭本地过滤，配合 `onSearch` 实现远程搜索。">远程搜索</code>

## API

### SelectProps

| 属性            | 说明                                                                                            | 类型                                                                 | 默认值       |
| --------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------ |
| options         | 选项列表                                                                                        | `SelectOption[]`（`{ label, value, disabled? }`）                    | -            |
| value           | 当前值（受控）；`labelInValue` 时为 `{ value, label }` 形态                                     | `SelectOutValue`                                                     | -            |
| defaultValue    | 默认值（非受控）；`labelInValue` 时为 `{ value, label }` 形态                                   | `SelectOutValue`                                                     | -            |
| variant         | 变体样式                                                                                        | `'default' \| 'filled' \| 'bordered'`                                | `'default'`  |
| size            | 尺寸                                                                                            | `'sm' \| 'md' \| 'lg'`                                               | `'md'`       |
| multiple        | 是否多选                                                                                        | `boolean`                                                            | `false`      |
| labelInValue    | 取值是否携带 label（影响 `value` / `defaultValue` / `onChange`）                                | `boolean`                                                            | `false`      |
| searchable      | 是否可搜索（默认按选项 `label` 的字符串本地过滤）                                               | `boolean`                                                            | `false`      |
| filterOption    | 过滤行为：`true` 默认本地过滤；`false` 关闭本地过滤（配合 `onSearch` 远程搜索）；函数自定义匹配 | `boolean \| ((inputValue: string, option: SelectOption) => boolean)` | `true`       |
| onSearch        | 搜索输入变化回调                                                                                | `(value: string) => void`                                            | -            |
| maxTagCount     | 多选模式下最多显示的标签数量，超出以 `+N...` 收敛                                               | `number`                                                             | -            |
| notFoundContent | 下拉列表为空时展示的内容                                                                        | `ReactNode`                                                          | `无匹配选项` |
| clearable       | 是否可清除                                                                                      | `boolean`                                                            | `false`      |
| disabled        | 是否禁用                                                                                        | `boolean`                                                            | `false`      |
| loading         | 是否加载中                                                                                      | `boolean`                                                            | `false`      |
| placeholder     | 占位文本                                                                                        | `string`                                                             | -            |
| onChange        | 值变化回调                                                                                      | `(value: string \| number \| (string \| number)[]) => void`          | -            |

继承 `React.AriaAttributes`（`aria-*` 属性）。
