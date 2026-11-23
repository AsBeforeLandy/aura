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
import { Form } from '@aura-react-comp/design';
```

## 何时使用

- 需要创建一个数据录入表单
- 需要对用户输入进行校验
- 需要多种布局方式（垂直、水平、行内）

## 代码演示

<code src="./demo/inline-layout.tsx" description="行内布局。所有表单项水平排列，适合搜索、筛选等场景。">行内表单</code>

<code src="./demo/vertical-layout.tsx" description="垂直布局（默认）。标签在输入框上方。">垂直布局</code>
<code src="./demo/horizontal-layout.tsx" description="水平布局。标签和输入框在同一行，标签默认右对齐。">水平布局</code>
<code src="./demo/size.tsx" description="提供 `sm`、`md`、`lg` 三种表单尺寸。">表单尺寸</code>
<code src="./demo/label-align.tsx" description="Form 级别设置 `labelAlign`，Form.Item 可覆盖。">标签对齐</code>
<code src="./demo/label-width.tsx" description="水平布局下通过 `labelWidth` 控制标签宽度。">标签宽度</code>
<code src="./demo/validation.tsx" description="通过 rules 配置验证规则，支持必填、长度、正则校验。">表单验证</code>
<code src="./demo/custom-validator.tsx" description="通过 `rules.validator` 实现自定义同步/异步验证。">自定义验证</code>
<code src="./demo/required-star.tsx" description="设置 `required` 仅显示必填星号，不绑定验证规则。">必填星号</code>
<code src="./demo/disabled.tsx" description="设置 `disabled` 后整个表单不可操作。">禁用表单</code>
<code src="./demo/item-disabled.tsx" description="在 Form.Item 上设置 `disabled` 仅禁用单个表单项。">单项禁用</code>
<code src="./demo/form-list.tsx" description="通过 `Form.List` 实现动态增减表单项，适合批量录入场景。">动态表单</code>
<code src="./demo/form-instance.tsx" description="`Form.useForm()` 创建实例：`setFieldsValue` 编辑回填、`validateFields` 外部提交。">命令式实例</code>
<code src="./demo/dependencies.tsx" description="`dependencies` 声明依赖：密码变化时确认密码自动重校验。">字段依赖</code>
<code src="./demo/use-watch.tsx" description="`Form.useWatch` 订阅字段值做联动渲染。">值联动渲染</code>
<code src="./demo/required-mark.tsx" description="`requiredMark='optional'`：非必填项标注「可选」。">可选标注</code>

## 表单布局规范

- **horizontal 布局下，操作按钮（提交 / 取消 / 添加行等）必须与输入框列对齐**：
  用 `<Form.Item label=" ">` 空占位对齐——label 占位宽度自动与其他行一致：

  ```tsx | pure
  <Form layout="horizontal" labelWidth={96}>
    <Form.Item name="name" label="姓名">
      <Input />
    </Form.Item>
    <Form.Item label=" ">
      <Button type="submit" variant="primary">
        提交
      </Button>
    </Form.Item>
  </Form>
  ```

- **vertical / inline 布局**下按钮直接作为普通 Form.Item 放置，无需占位。
- **Form.List 的添加按钮**同样用 `<Form.Item label=" ">` 包裹，保证与
  列表行的输入框列对齐。
- 栅格场景用 `labelCol / wrapperCol` 代替 `labelWidth`，按钮区的
  `wrapperCol.offset` 与 labelCol.span 保持一致。

## API

### FormProps

| 属性               | 说明                                                                                 | 类型                                            | 默认值         |
| ------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------- | -------------- |
| layout             | 布局方式                                                                             | `'horizontal' \| 'vertical' \| 'inline'`        | `'horizontal'` |
| initialValues      | 初始值                                                                               | `Record<string, unknown>`                       | -              |
| onFinish           | 提交成功回调                                                                         | `(values: Record<string, unknown>) => void`     | -              |
| onFinishFailed     | 提交失败回调                                                                         | `(errors: FormError[]) => void`                 | -              |
| onValuesChange     | 任意字段值变化回调（联动与持久化钩子）                                               | `(changed: { name, value }, allValues) => void` | -              |
| scrollToFirstError | 提交失败时滚动到第一个错误字段                                                       | `boolean`                                       | `false`        |
| requiredMark       | 必填标记：`false` 不显示；`'optional'` 在非必填项标注「可选」                        | `boolean \| 'optional'`                         | `true`         |
| labelAlign         | 标签对齐方式                                                                         | `'left' \| 'right'`                             | `'right'`      |
| colon              | 标签后是否显示冒号（缺省按布局推导：horizontal / inline 为 true，vertical 为 false） | `boolean`                                       | 按布局推导     |
| disabled           | 是否禁用所有表单项                                                                   | `boolean`                                       | `false`        |
| size               | 表单尺寸                                                                             | `'sm' \| 'md' \| 'lg'`                          | `'md'`         |
| form               | 命令式实例（由 `Form.useForm()` 创建）                                               | `FormInstance`                                  | -              |

> `name` 支持**嵌套点路径**（如 `user.name`），值按路径写入嵌套对象。

继承 `HTMLAttributes<HTMLFormElement>`。

### Form.useForm

创建命令式实例（用法与 antd 一致：`const [form] = Form.useForm()`），把实例传给 `<Form form={form}>` 后可在表单外部读写与校验：

| 方法                   | 说明                                                                   | 参数 / 返回                                                        |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `form.getFieldsValue`  | 获取全部字段值（深拷贝）                                               | `() => Record<string, unknown>`                                    |
| `form.getFieldValue`   | 获取单个字段值（支持嵌套点路径）                                       | `(name: string) => unknown`                                        |
| `form.setFieldValue`   | 设置单个字段值（支持嵌套点路径）                                       | `(name: string, value: unknown) => void`                           |
| `form.setFieldsValue`  | 批量合并字段值（编辑回填）                                             | `(values: Record<string, unknown>) => void`                        |
| `form.validateFields`  | 校验全部或指定字段；通过 resolve 全部字段值，失败 reject `FormError[]` | `(names?: string \| string[]) => Promise<Record<string, unknown>>` |
| `form.resetFields`     | 重置为 initialValues 并清空校验错误                                    | `() => void`                                                       |
| `form.getFieldError`   | 获取单字段错误信息                                                     | `(name: string) => string[]`                                       |
| `form.getFieldsError`  | 获取全部字段错误信息                                                   | `() => Record<string, string[]>`                                   |
| `form.setFields`       | 直接设置字段的错误 / touched / value                                   | `(updates: Record<string, { errors, touched, value }>) => void`    |
| `form.isFieldTouched`  | 字段是否被交互过                                                       | `(name: string) => boolean`                                        |
| `form.isFieldsTouched` | 是否存在（或指定字段存在）交互记录                                     | `(names?: string[]) => boolean`                                    |
| `form.scrollToField`   | 滚动到指定字段的表单项                                                 | `(name: string) => void`                                           |

- `setFieldsValue` / `setFieldValue` 后同步读取（`getFieldValue` / `validateFields`）即可拿到最新值。
- `validateFields` 只校验注册过 `rules` 的字段；传 `names` 可只校验部分字段。

### FormItemProps

| 属性              | 说明                                                    | 类型                                                | 默认值       |
| ----------------- | ------------------------------------------------------- | --------------------------------------------------- | ------------ |
| name              | 字段名称（支持嵌套点路径 `user.name`）                  | `string`                                            | -            |
| label             | 标签文本                                                | `ReactNode`                                         | -            |
| labelAlign        | 标签对齐，覆盖 Form 级别                                | `'left' \| 'right'`                                 | -            |
| labelWidth        | 标签宽度（仅 horizontal 模式）                          | `number \| string`                                  | -            |
| rules             | 验证规则                                                | `RuleType[]`                                        | -            |
| required          | 是否必填（仅显示星号）                                  | `boolean`                                           | `false`      |
| colon             | 是否显示冒号，覆盖 Form 推导（空占位 label 时传 false） | `boolean`                                           | 按布局推导   |
| dependencies      | 依赖字段路径：任一依赖变化时重新校验自身（如确认密码）  | `string[]`                                          | -            |
| validateTrigger   | 触发校验的事件                                          | `string \| string[]`                                | `'onChange'` |
| help              | 自定义帮助文案（设置后覆盖校验错误信息）                | `ReactNode`                                         | -            |
| extra             | 额外说明，展示在控件下方                                | `ReactNode`                                         | -            |
| htmlFor           | label 的 for 属性，缺省用 name                          | `string`                                            | -            |
| layout            | 布局方式，覆盖 Form 级别                                | `'horizontal' \| 'vertical' \| 'inline'`            | -            |
| tooltip           | label 的提示信息（问号图标，悬浮展示）                  | `ReactNode`                                         | -            |
| validateFirst     | 规则按顺序校验，遇错即停                                | `boolean`                                           | `false`      |
| validateStatus    | 手动指定校验状态（优先级高于自动推导）                  | `'success' \| 'warning' \| 'error' \| 'validating'` | -            |
| normalize         | 输入值规范化（写入 store 前调用）                       | `(value, prevValue, allValues) => unknown`          | -            |
| getValueFromEvent | 从 onChange 事件中取值                                  | `(...args) => unknown`                              | -            |
| initialValue      | 字段级初始值                                            | `unknown`                                           | -            |
| preserve          | 字段卸载后是否保留值                                    | `boolean`                                           | `true`       |
| hidden            | 隐藏字段（保持注册与校验，仅不渲染）                    | `boolean`                                           | `false`      |
| disabled          | 是否禁用该项                                            | `boolean`                                           | `false`      |
| noStyle           | 不占用布局（无 label、无边距），仅做数据收集与校验      | `boolean`                                           | `false`      |
| valuePropName     | 子元素接收值的属性名（如 Checkbox 用 `checked`）        | `string`                                            | `'value'`    |

### Form.useWatch

订阅某个字段的值做联动渲染（用法与 antd 一致）：

```tsx | pure
const keyword = Form.useWatch('keyword', form);
// keyword 变化时组件自动重渲染
```

> watch 的值建议为原始类型（string / number / boolean）；对象类型每次快照都是新引用。

### Form.useFormInstance

获取最近 `<Form>` 的命令式实例（封装组件内透传 form 的标准姿势）：

```tsx | pure
const form = Form.useFormInstance();
```

### Form.Provider

多表单协调容器：内部所有**带 `name`** 的 Form 提交成功后会触发 `onFormFinish`：

```tsx | pure
<Form.Provider
  onFormFinish={(name, { values, forms }) => {
    console.log(name, values);
  }}
>
  <Form name="login">...</Form>
  <Form name="signup">...</Form>
</Form.Provider>
```

### Form.ErrorList

字段错误列表，常配合 noStyle / 自定义控件展示一组字段错误：

```tsx | pure
const errors = form.getFieldError('city');
<Form.ErrorList errors={errors} />;
```

### noStyle 错误冒泡

`noStyle` 字段的校验错误会向上冒泡到最近的「有样式」Form.Item 展示
（适合 Input.Group / 自定义组合控件的场景）：

```tsx | pure
<Form.Item label="地址">
  <Input.Group compact>
    <Form.Item name="city" noStyle rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </Input.Group>
</Form.Item>
```

### RuleType

| 属性         | 说明                                                          | 类型                                                                                                  | 默认值   |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| required     | 是否必填                                                      | `boolean`                                                                                             | -        |
| message      | 错误提示信息（支持 `{{label}}` 占位符与函数形态）             | `string \| ((rule) => string)`                                                                        | 内置提示 |
| min          | 最小值（number 按数值比较，string/Array 按长度）              | `number`                                                                                              | -        |
| max          | 最大值（同上）                                                | `number`                                                                                              | -        |
| len          | 精确长度（string/Array）或精确数值（number）                  | `number`                                                                                              | -        |
| pattern      | 正则校验                                                      | `RegExp`                                                                                              | -        |
| type         | 内置格式校验                                                  | `'object' \| 'string' \| 'email' \| 'url' \| 'number' \| 'integer' \| 'boolean' \| 'array' \| 'date'` | -        |
| enum         | 值必须在列表内                                                | `unknown[]`                                                                                           | -        |
| whitespace   | 空白字符串也视为空（配合 required）                           | `boolean`                                                                                             | -        |
| transform    | 校验前转换值（不影响表单值）                                  | `(value: unknown) => unknown`                                                                         | -        |
| warningOnly  | 仅警告：不阻止提交，警告样式展示                              | `boolean`                                                                                             | `false`  |
| defaultField | 数组元素级规则（对每个元素应用）                              | `RuleType`                                                                                            | -        |
| fields       | 对象子字段 schema（配合 `type='object'`，子错误写入嵌套路径） | `Record<string, RuleType>`                                                                            | -        |
| validator    | 自定义验证函数（antd 双签名兼容）                             | `(value) => boolean \| Promise<boolean>` 或 `(rule, value) => Promise<void \| Error>`                 | -        |

### Form.List

通过 `Form.List` 管理动态增减的表单字段组。

```tsx | pure
<Form.List name="users">
  {(fields, { add, remove, move }) => (
    <>
      {fields.map((field, index) => (
        <div key={field.key}>
          <Form.Item name={`users.${index}.name`} label="姓名">
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

| 属性     | 说明                           | 类型                                                                        | 默认值  |
| -------- | ------------------------------ | --------------------------------------------------------------------------- | ------- |
| name     | 字段名（对应 values 中的数组） | `string`                                                                    | -       |
| compact  | 紧凑模式，同行输入框无中间圆角 | `boolean`                                                                   | `false` |
| children | 渲染函数                       | `(fields: FormListFieldData[], operations: FormListOperation) => ReactNode` | -       |

#### FormListFieldData

| 属性 | 说明                       | 类型     |
| ---- | -------------------------- | -------- |
| key  | 唯一标识（用作 React key） | `number` |
| name | 字段索引                   | `number` |

#### FormListOperation

| 方法   | 说明                             | 类型                                                                     |
| ------ | -------------------------------- | ------------------------------------------------------------------------ |
| add    | 新增一项，可传入默认值与插入位置 | `(defaultValue?: Record<string, unknown>, insertIndex?: number) => void` |
| remove | 删除指定索引项（支持批量）       | `(index: number \| number[]) => void`                                    |
| move   | 调整项顺序                       | `(from: number, to: number) => void`                                     |
