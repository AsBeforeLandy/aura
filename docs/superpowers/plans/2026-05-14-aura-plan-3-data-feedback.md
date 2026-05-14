# Aura 组件库 — Plan 3: 数据展示与反馈组件

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现第二批组件 — Tag、Badge、Avatar、Tooltip、Card、Collapse、Tabs、Empty、Message、Notification。

**Architecture:** 延续 Plan 1/2 建立的模式。Card 使用组合式子组件（Card.Header/Card.Body 等）。Message 和 Notification 使用静态方法调用模式。

**Tech Stack:** React 18 + TypeScript + Less + CSS Variables + Vitest

**Depends on:** Plan 1 + Plan 2

---

## Task 1: Tag

```typescript
interface TagProps extends BaseProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  onClose?: () => void;
}
```

**子组件:** Tag.Group / Tag.Checkable

---

## Task 2: Badge

```typescript
interface BadgeProps extends BaseProps {
  count?: number;
  dot?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  overflowCount?: number;
  showZero?: boolean;
}
```

---

## Task 3: Avatar

```typescript
interface AvatarProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg' | number;
  shape?: 'circle' | 'square';
  src?: string;
  alt?: string;
  variant?: 'default' | 'primary';
}
```

**子组件:** Avatar.Group

---

## Task 4: Tooltip

```typescript
interface TooltipProps extends BaseProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
}
```

---

## Task 5: Card

```typescript
interface CardProps extends BaseProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  loading?: boolean;
}

// 子组件
Card.Header / Card.Title / Card.Body / Card.Actions / Card.Footer / Card.Cover
```

---

## Task 6: Collapse

```typescript
interface CollapseProps extends BaseProps {
  accordion?: boolean;
  defaultActiveKey?: string | string[];
  activeKey?: string | string[];
  onChange?: (keys: string[]) => void;
}

interface CollapseItemProps extends BaseProps {
  key: string;
  title: React.ReactNode;
  disabled?: boolean;
}
```

**子组件:** Collapse.Item

---

## Task 7: Tabs

```typescript
interface TabsProps extends BaseProps {
  defaultActiveKey?: string;
  activeKey?: string;
  variant?: 'default' | 'card' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  onChange?: (key: string) => void;
}

interface TabProps {
  key: string;
  title: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}
```

**子组件:** Tabs.Tab

---

## Task 8: Empty

```typescript
interface EmptyProps extends BaseProps {
  description?: React.ReactNode;
  image?: React.ReactNode;
  imageStyle?: React.CSSProperties;
}
```

**子组件:** Empty.Preset

---

## Task 9: Message

```typescript
// 静态方法调用模式
const message = {
  success(content: string, duration?: number): void;
  error(content: string, duration?: number): void;
  warning(content: string, duration?: number): void;
  info(content: string, duration?: number): void;
  loading(content: string, duration?: number): void;
};
```

---

## Task 10: Notification

```typescript
interface NotificationOptions {
  title?: string;
  content: string;
  duration?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  onClose?: () => void;
}

const notification = {
  open(options: NotificationOptions): void;
  success(options: Omit<NotificationOptions, 'variant'>): void;
  error(options: Omit<NotificationOptions, 'variant'>): void;
  warning(options: Omit<NotificationOptions, 'variant'>): void;
  info(options: Omit<NotificationOptions, 'variant'>): void;
};
```

---

## Task 11: 更新导出和导航

---

## Task 12: 全量测试 + dumi 验证
