---
title: Form
subtitle: 表单
group: 表单高级
category: Components
description: 高性能表单控件，支持多种布局和字段验证。
order: 3
demo:
  cols: 2
toc: content
---

# Form 表单

高性能表单控件，支持垂直、水平、行内三种布局，内置字段验证与错误提示。

```tsx | pure
import { Form } from "@aura/ui";
```

## 何时使用

- 需要创建一个数据录入表单
- 需要对用户输入进行校验
- 需要多种布局方式（垂直、水平、行内）

## 代码演示

<code src="./demo/vertical-layout.tsx" description="垂直布局（默认）。标签在输入框上方。">垂直布局</code>
<code src="./demo/horizontal-layout.tsx" description="水平布局。标签和输入框在同一行，标签默认右对齐。">水平布局</code>
<code src="./demo/inline-layout.tsx" description="行内布局。所有表单项水平排列，适合搜索、筛选等场景。">行内表单</code>
<code src="./demo/size.tsx" description="提供 `sm`、`md`、`lg` 三种表单尺寸。">表单尺寸</code>
<code src="./demo/label-align.tsx" description="Form 级别设置 `labelAlign`，Form.Item 可覆盖。">标签对齐</code>
<code src="./demo/label-width.tsx" description="水平布局下通过 `labelWidth` 控制标签宽度。">标签宽度</code>
<code src="./demo/validation.tsx" description="通过 rules 配置验证规则，支持必填、长度、正则校验。">表单验证</code>
<code src="./demo/custom-validator.tsx" description="通过 `rules.validator` 实现自定义同步/异步验证。">自定义验证</code>
<code src="./demo/required-star.tsx" description="设置 `required` 仅显示必填星号，不绑定验证规则。">必填星号</code>
<code src="./demo/disabled.tsx" description="设置 `disabled` 后整个表单不可操作。">禁用表单</code>
<code src="./demo/item-disabled.tsx" description="在 Form.Item 上设置 `disabled` 仅禁用单个表单项。">单项禁用</code>
<code src="./demo/form-list.tsx" description="通过 `Form.List` 实现动态增减表单项，适合批量录入场景。">动态表单</code>

## API

### FormProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| layout | 布局方式 | `'vertical' \| 'horizontal' \| 'inline'` | `'vertical'` |
| initialValues | 初始值 | `Record<string, unknown>` | - |
| onFinish | 提交成功回调 | `(values: Record<string, unknown>) => void` | - |
| onFinishFailed | 提交失败回调 | `(errors: FormError[]) => void` | - |
| labelAlign | 标签对齐方式 | `'left' \| 'right'` | `'right'` |
| colon | 标签后是否显示冒号 | `boolean` | `false` |
| disabled | 是否禁用所有表单项 | `boolean` | `false` |
| size | 表单尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |

继承 `HTMLAttributes<HTMLFormElement>`。

### FormItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名称 | `string` | - |
| label | 标签文本 | `ReactNode` | - |
| labelAlign | 标签对齐，覆盖 Form 级别 | `'left' \| 'right'` | - |
| labelWidth | 标签宽度（仅 horizontal 模式） | `number \| string` | - |
| rules | 验证规则 | `RuleType[]` | - |
| required | 是否必填（仅显示星号） | `boolean` | `false` |
| disabled | 是否禁用该项 | `boolean` | `false` |

### RuleType

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| required | 是否必填 | `boolean` | - |
| message | 错误提示信息 | `string` | 内置提示 |
| min | 最小长度 | `number` | - |
| max | 最大长度 | `number` | - |
| pattern | 正则校验 | `RegExp` | - |
| validator | 自定义验证函数 | `(value: unknown) => boolean \| Promise<boolean>` | - |

### Form.List

通过 `Form.List` 管理动态增减的表单字段组。

```tsx | pure
<Form.List name="users">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field, index) => (
        <div key={field.key}>
          <Form.Item name={`users[${index}].name`} label="姓名">
            <Input />
          </Form.Item>
          <button onClick={() => remove(index)}>删除</button>
        </div>
      ))}
      <button onClick={() => add()}>添加</button>
    </>
  )}
</Form.List>
```

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段名（对应 values 中的数组） | `string` | - |
| compact | 紧凑模式，同行输入框无中间圆角 | `boolean` | `false` |
| children | 渲染函数 | `(fields: FormListFieldData[], operations: FormListOperation) => ReactNode` | - |

#### FormListFieldData

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一标识（用作 React key） | `number` |
| name | 字段索引 | `number` |

#### FormListOperation

| 方法 | 说明 | 类型 |
| --- | --- | --- |
| add | 新增一项，可传入默认值 | `(defaultValue?: Record<string, unknown>) => void` |
| remove | 删除指定索引项 | `(index: number) => void` |
