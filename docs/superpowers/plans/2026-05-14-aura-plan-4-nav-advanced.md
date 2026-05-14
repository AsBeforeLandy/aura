# Aura 组件库 — Plan 4: 导航布局与高级表单

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现第三批组件 — Menu、Breadcrumb、Pagination、Steps、Dropdown、Slider、Rate、Upload、Form、Result、Popconfirm、Layout、Flex、Scrollbar。

**Architecture:** 延续已建模式。Form 提供轻量表单验证。Layout 为应用级布局容器。

**Tech Stack:** React 18 + TypeScript + Less + CSS Variables + Vitest

**Depends on:** Plan 1 + Plan 2 + Plan 3

---

## Task 1: Menu

```typescript
interface MenuProps extends BaseProps {
  mode?: 'vertical' | 'horizontal' | 'inline';
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  collapsible?: boolean;
}

// 子组件: Menu.Item / Menu.SubMenu / Menu.Group
```

---

## Task 2: Breadcrumb

```typescript
interface BreadcrumbProps extends BaseProps {
  separator?: React.ReactNode;
}

// 子组件: Breadcrumb.Item
```

---

## Task 3: Pagination

```typescript
interface PaginationProps extends BaseProps {
  current?: number;
  pageSize?: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  size?: 'sm' | 'md';
  onChange?: (page: number, pageSize: number) => void;
}
```

---

## Task 4: Steps

```typescript
interface StepsProps extends BaseProps {
  current?: number;
  variant?: 'default' | 'dot' | 'navigation';
  size?: 'sm' | 'md';
  direction?: 'horizontal' | 'vertical';
  onChange?: (current: number) => void;
}

// 子组件: Steps.Step
```

---

## Task 5: Dropdown

```typescript
interface DropdownProps extends BaseProps {
  menu: Array<{ key: string; label: React.ReactNode; disabled?: boolean; danger?: boolean }>;
  trigger?: 'hover' | 'click';
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  disabled?: boolean;
  onMenuClick?: (key: string) => void;
}
```

---

## Task 6: Slider

```typescript
interface SliderProps extends BaseProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  marks?: Record<number, React.ReactNode>;
  range?: boolean;
  onChange?: (value: number | [number, number]) => void;
}
```

---

## Task 7: Rate

```typescript
interface RateProps extends BaseProps {
  count?: number;
  value?: number;
  defaultValue?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
}
```

---

## Task 8: Upload

```typescript
interface UploadProps extends BaseProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number;
  listType?: 'text' | 'picture' | 'picture-card';
  action?: string;
  headers?: Record<string, string>;
  onChange?: (fileList: UploadFile[]) => void;
  beforeUpload?: (file: File) => boolean | Promise<File>;
}

interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  file?: File;
}

// 子组件: Upload.Dragger
```

---

## Task 9: Form

```typescript
interface FormProps extends BaseProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  initialValues?: Record<string, unknown>;
  onFinish?: (values: Record<string, unknown>) => void;
  onFinishFailed?: (errors: FormError[]) => void;
}

interface FormItemProps extends BaseProps {
  name?: string;
  label?: React.ReactNode;
  rules?: Array<{ required?: boolean; message?: string; pattern?: RegExp; validator?: (value: unknown) => boolean | Promise<boolean> }>;
  required?: boolean;
}

// 子组件: Form.Item
```

---

## Task 10: Result

```typescript
interface ResultProps extends BaseProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500';
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}
```

---

## Task 11: Popconfirm

```typescript
interface PopconfirmProps extends BaseProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  variant?: 'default' | 'warning' | 'error';
  placement?: 'top' | 'bottom' | 'left' | 'right';
}
```

---

## Task 12: Layout

```typescript
interface LayoutProps extends BaseProps {
  hasSider?: boolean;
}

// 子组件: Layout.Header / Layout.Body / Layout.Sider / Layout.Footer
```

---

## Task 13: Flex

```typescript
interface FlexProps extends BaseProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'sm' | 'md' | 'lg' | number;
}
```

---

## Task 14: Scrollbar

```typescript
interface ScrollbarProps extends BaseProps {
  maxHeight?: number | string;
  maxWidth?: number | string;
  alwaysShow?: boolean;
}
```

---

## Task 15: 更新导出和导航

---

## Task 16: 全量测试 + dumi 验证
