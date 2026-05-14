# Aura 组件库 — Plan 2: 核心基础组件

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现第一批核心 UI 组件 — Typography、Space、Divider、Input、Textarea、Select、Checkbox、Radio、Switch、Alert、Spin。

**Architecture:** 所有组件遵循 Plan 1 建立的模式：CSS Variables 引用 tokens、BEM 命名（prefixCls）、统一 props 约定（variant/size/disabled/loading）、JSDoc 中文注释、组合式子组件。

**Tech Stack:** React 18 + TypeScript + Less + CSS Variables + Vitest

**Depends on:** Plan 1（Design Tokens + ThemeProvider + Button 模式）

---

## Component Pattern Template

每个组件遵循相同的开发模式：

```
1. 编写测试 → 2. 运行验证失败 → 3. 实现 TSX + Less → 4. 运行验证通过 → 5. 添加 demo → 6. 提交
```

### 组件文件结构（每个组件）

```
packages/ui/src/<component>/
├── index.tsx          # 组件实现
├── index.less         # 样式
├── index.test.tsx     # 测试
└── demo/
    └── basic.tsx      # dumi demo
```

---

## Task 1: Typography

**Files:**
- Create: `packages/ui/src/typography/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface TypographyProps extends BaseProps {}

interface TitleProps extends BaseProps {
  level?: 1 | 2 | 3 | 4 | 5;
}

interface TextProps extends BaseProps {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  strong?: boolean;
  underline?: boolean;
  delete?: boolean;
  code?: boolean;
  mark?: boolean;
}

interface ParagraphProps extends BaseProps {
  ellipsis?: boolean | { rows: number };
}
```

**子组件:** Typography.Title / Typography.Text / Typography.Paragraph

---

## Task 2: Space

**Files:**
- Create: `packages/ui/src/space/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface SpaceProps extends BaseProps {
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | number;
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'baseline';
}
```

---

## Task 3: Divider

**Files:**
- Create: `packages/ui/src/divider/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface DividerProps extends BaseProps {
  direction?: 'horizontal' | 'vertical';
  variant?: 'default' | 'dashed';
  orientation?: 'left' | 'center' | 'right';
}
```

---

## Task 4: Input

**Files:**
- Create: `packages/ui/src/input/{index.tsx, index.less, index.test.tsx, demo/basic.tsx, demo/password.tsx, demo/search.tsx}`

**Props:**
```typescript
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
  status?: 'default' | 'error' | 'warning';
}
```

**子组件:** Input.Password / Input.Search / Input.Group

---

## Task 5: Textarea

**Files:**
- Create: `packages/ui/src/textarea/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  autoSize?: boolean | { minRows: number; maxRows: number };
  showCount?: boolean;
  maxLength?: number;
  status?: 'default' | 'error' | 'warning';
}
```

---

## Task 6: Select

**Files:**
- Create: `packages/ui/src/select/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface SelectProps extends BaseProps {
  variant?: 'default' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  options: Array<{ label: React.ReactNode; value: string | number }>;
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  onChange?: (value: string | number | (string | number)[]) => void;
  status?: 'default' | 'error' | 'warning';
}
```

**子组件:** Select.Option / Select.OptGroup

---

## Task 7: Checkbox

**Files:**
- Create: `packages/ui/src/checkbox/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

interface CheckboxGroupProps extends BaseProps {
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  options: Array<{ label: React.ReactNode; value: string | number; disabled?: boolean }>;
  onChange?: (value: (string | number)[]) => void;
}
```

**子组件:** Checkbox.Group

---

## Task 8: Radio

**Files:**
- Create: `packages/ui/src/radio/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

interface RadioGroupProps extends BaseProps {
  value?: string | number;
  defaultValue?: string | number;
  options: Array<{ label: React.ReactNode; value: string | number; disabled?: boolean }>;
  onChange?: (value: string | number) => void;
  direction?: 'horizontal' | 'vertical';
}
```

**子组件:** Radio.Group

---

## Task 9: Switch

**Files:**
- Create: `packages/ui/src/switch/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface SwitchProps extends Omit<BaseProps, 'onChange'> {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}
```

---

## Task 10: Alert

**Files:**
- Create: `packages/ui/src/alert/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface AlertProps extends BaseProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: React.ReactNode;
  closable?: boolean;
  showIcon?: boolean;
  onClose?: () => void;
}
```

**子组件:** Alert.Title / Alert.Description

---

## Task 11: Spin

**Files:**
- Create: `packages/ui/src/spin/{index.tsx, index.less, index.test.tsx, demo/basic.tsx}`

**Props:**
```typescript
interface SpinProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg';
  spinning?: boolean;
  tip?: React.ReactNode;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
}
```

---

## Task 12: 更新导出和 dumi 导航

**Files:**
- Modify: `packages/ui/src/index.ts` — 导出所有新组件
- Modify: `.dumirc.ts` — 在导航中添加新组件菜单项

---

## Task 13: 全量测试 + dumi 验证

- [ ] `pnpm test` 全部通过
- [ ] `pnpm dev` 启动文档站，验证所有组件的亮/暗模式渲染
- [ ] 最终提交
