---
name: aura-component-guide
description: Use when building UI with Aura component library - provides component selection guidance, API reference, and code examples
---

# Aura 组件使用指南

## 快速选择

根据场景选择组件：
- **通用**: Button, Typography, Space, Divider
- **表单**: Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Rate, Upload, Form
- **数据展示**: Tag, Badge, Avatar, Tooltip, Card, Collapse, Tabs, Empty
- **反馈**: Alert, Spin, Message, Notification, Result, Popconfirm
- **导航**: Menu, Breadcrumb, Pagination, Steps, Dropdown
- **布局**: Layout, Flex, Scrollbar

## 核心模式

### 复合组件
Aura 使用复合组件模式：
```tsx
import { Menu } from '@aura/ui';

<Menu>
  <Menu.Item itemKey="a" title="首页">内容</Menu.Item>
  <Menu.SubMenu subKey="sub" title="子菜单">
    <Menu.Item itemKey="b" title="选项">内容</Menu.Item>
  </Menu.SubMenu>
</Menu>
```

其他复合组件：Tabs.Tab, Collapse.Item, Form.Item, Layout.Header/Body/Sider/Footer, Upload.Dragger

### 受控/非受控
所有表单组件支持受控和非受控模式：
- 受控：`value` + `onChange`
- 非受控：`defaultValue`（内部管理状态）

### 主题切换
使用 ThemeProvider：
```tsx
import { ThemeProvider } from '@aura/ui';

<ThemeProvider defaultTheme="light">
  <App />
</ThemeProvider>
```

## 组件速查

### Button
variant: default | primary | dashed | text | link
size: sm | md | lg
```tsx
<Button variant="primary" size="md">点击</Button>
```

### Input
支持复合组件：Input.Password, Input.Search, Input.Group
```tsx
<Input placeholder="请输入" />
<Input.Password placeholder="密码" />
<Input.Search placeholder="搜索" onSearch={handleSearch} />
```

### Select
```tsx
<Select options={[{ value: 'a', label: '选项A' }]} onChange={handleChange} />
```

### Form
```tsx
<Form layout="vertical" onFinish={handleSubmit}>
  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入' }]}>
    <Input />
  </Form.Item>
</Form>
```

### Message（静态方法）
```tsx
import { message } from '@aura/ui';
message.success('操作成功');
message.error('操作失败');
```

### Notification（静态方法）
```tsx
import { notification } from '@aura/ui';
notification.success({ title: '成功', content: '操作完成' });
```
