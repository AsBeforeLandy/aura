# Aura 组件五件套模板

五个文件的骨架均提炼自仓库现有组件（`packages/ui/src/badge`、`packages/business/src/modal-form`、`packages/x/src/bubble`），直接复制到新组件目录后替换占位符即可。占位符约定：`Xxx` = 组件名（PascalCase），`xxx` = 目录名 / 类名片段（kebab-case）。

新建组件时按 Step 1 选定的包决定差异点（见每节开头的「包差异」）。

## 1. index.tsx（组件实现）

ui / business 默认走 forwardRef + displayName；x 包以 `React.FC` 为主（把 forwardRef 部分换成 `export const XxxBase: React.FC<XxxProps> = ({...}) => {...}`，需要 ref 时才用 forwardRef 并导出 `XxxRef` 类型，参照 `code-highlighter`）。

```tsx
import React, { forwardRef } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface XxxProps {
  /** 一句话说明该 prop 的作用（每个 prop 都要有 JSDoc） */
  title?: string;
  /**
   * 视觉变体
   * @default 'default'
   */
  variant?: 'default' | 'primary';
  /** 是否禁用 */
  disabled?: boolean;
  /** 受控值（表单/交互组件必写受控说明） */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子内容 */
  children?: React.ReactNode;
}

export const Xxx = forwardRef<HTMLDivElement, XxxProps>(
  (
    {
      title,
      variant = 'default',
      disabled = false,
      value,
      onChange,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const rootCls = classNames(
      prefixCls('xxx'),
      variant !== 'default' && prefixCls(`xxx-${variant}`),
      disabled && prefixCls('xxx-disabled'),
      className,
    );

    return (
      <div ref={ref} className={rootCls} style={style} role="...">
        {children}
      </div>
    );
  },
);

Xxx.displayName = 'Xxx';
```

要点回顾：

- 每个 prop 一行 JSDoc；默认值标 `@default`。
- 根类名 = `prefixCls('xxx')` → `.aura-xxx`，与 index.less 根选择器一致。**x 包组件在参数里带 `x-` 前缀**：`prefixCls('x-stop-button')` → `.aura-x-stop-button`。
- 受控模式：`const isControlled = value !== undefined;` 受控时交互只调 `onChange`，不自己改内部状态。
- 纯逻辑（格式化、树运算、日期）抽到同目录 `utils.ts`，**不 import React**，在测试文件里直接单测。

## 2. index.less（样式）

```less
.aura-xxx {
  // 布局与间距用 spacing / radius / font-size 令牌
  display: inline-flex;
  align-items: center;
  gap: var(--aura-spacing-2);
  padding: var(--aura-spacing-1) var(--aura-spacing-3);
  border-radius: var(--aura-radius-md);
  font-size: var(--aura-font-size-md);

  // 颜色只用令牌：text / bg / border / primary / success / warning / error / info / gray-*
  color: var(--aura-text);
  background: var(--aura-bg-secondary);
  border: 1px solid var(--aura-border);

  // 过渡用 duration / easing 令牌
  transition:
    background var(--aura-duration-normal) var(--aura-easing),
    border-color var(--aura-duration-normal) var(--aura-easing);

  // 修饰类（BEM）：.aura-xxx-<语义>
  .aura-xxx-body {
    flex: 1;
  }

  // 状态类
  &-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

// 变体
.aura-xxx-primary {
  background: var(--aura-primary-600);
  color: var(--aura-text-inverse);
}

// 动画：@keyframes aura-xxx-<语义>
@keyframes aura-xxx-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 暗色模式差异
[data-theme='dark'] {
  .aura-xxx {
    background: var(--aura-bg-secondary);
    border-color: var(--aura-border);
  }
}
```

禁止事项：硬编码色值（hex/rgb/rgba）、`!important`、`color-mix`、令牌 fallback。需要新令牌（如「主色 + 22% 透明度」）时，去 `packages/ui/src/theme/tokens.css` 定义亮 / 暗两套值，组件只消费令牌。

**命名分包**（与仓库现状一致）：

- ui / business：修饰类单横线连写，如 `.aura-badge-dot-small`、`.aura-xxx-disabled`（上模板即此风格）。
- x：标准 BEM——根类 `.aura-x-<组件名>`，修饰符双横线 `.aura-x-xxx--disabled`，元素连写 `.aura-x-xxx-header`：

```less
.aura-x-xxx {
  // 元素：连写
  .aura-x-xxx-header {
    /* … */
  }

  // 修饰符：双横线
  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
```

**时长取值**：`--aura-duration-fast/normal/slow`（150/200/300ms）只用于 transition；`infinite` 循环动画的时长直接写字面值（参照 badge `0.3s`/`0.4s`）；keyframes 只动 `opacity` / `transform` / `background-position`。

## 3. index.test.tsx（测试）

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Xxx } from './index';

describe('Xxx', () => {
  // ── 正常 ──────────────────────────────────────────
  it('should render with default props', () => {
    const { getByText } = render(<Xxx title="标题" />);
    expect(getByText('标题')).toBeDefined();
  });

  it('should merge custom className and style', () => {
    const { container } = render(
      <Xxx className="custom" style={{ color: 'red' }} />,
    );
    const root = container.firstChild as HTMLDivElement;
    expect(root.classList.contains('aura-xxx')).toBe(true);
    expect(root.classList.contains('custom')).toBe(true);
  });

  it('should call onChange when controlled value changes', () => {
    const handleChange = vi.fn();
    const { getByRole } = render(<Xxx onChange={handleChange} />);
    fireEvent.click(getByRole('...'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // ── 边界 ──────────────────────────────────────────
  it('should handle empty / extreme values', () => {
    const { container } = render(<Xxx title="" disabled />);
    const root = container.firstChild as HTMLDivElement;
    expect(root.classList.contains('aura-xxx-disabled')).toBe(true);
  });

  // ── 异常 ──────────────────────────────────────────
  it('should not crash on invalid input', () => {
    expect(() => render(<Xxx value={undefined as never} />)).not.toThrow();
  });
});
```

要点回顾：

- 三类用例（正常 / 边界 / 异常）一个都不能少——覆盖率是全仓硬门禁。
- `vi.fn()` 测回调；断言 classList / DOM 结构这类行为，不 mock 渲染层。
- ui 包视觉组件再到 `packages/ui/src/a11y.test.tsx` 追加 axe 用例：

```tsx
it('Xxx', async () => {
  await expectNoViolations(<Xxx title="标题" />);
});
```

## 4. demo/basic.tsx（文档示例）

```tsx
import React from 'react';
import { Xxx } from '@aura/ui'; // business 包写 '@aura/business'，x 包写 '@aura/x'

/** 基础用法。 */
export default () => <Xxx title="标题" />;
```

- demo 是文档站可运行示例：默认导出一个组件、自包含、面向阅读；命名按语义（`basic.tsx` / `controlled.tsx` / `variant.tsx`）。
- demo 不参与构建与覆盖率统计，别把业务逻辑塞进来。

## 5. index.md（文档）

````md
---
title: Xxx
subtitle: 中文名
group: 数据展示
category: Components
description: 一句话描述（组件列表页会展示）。
order: 1
demo:
  cols: 2
toc: content
---

# Xxx 中文名

一句话描述。

```tsx | pure
import { Xxx } from '@aura/ui';
```
````

## 何时使用

- 需要……时
- 需要……时

## 代码演示

<code src="./demo/basic.tsx" description="基础用法。">基础用法</code>
<code src="./demo/controlled.tsx" description="受控模式。">受控模式</code>

## API

### XxxProps

| 属性     | 说明       | 类型                      | 默认值      |
| -------- | ---------- | ------------------------- | ----------- |
| title    | 标题       | `string`                  | -           |
| variant  | 视觉变体   | `'default' \| 'primary'`  | `'default'` |
| onChange | 值变化回调 | `(value: string) => void` | -           |

继承 `HTMLAttributes<HTMLDivElement>`。

````

**group 合法值**（决定侧栏分组，必须是现有分组）：

| 包 | 写法 | 可用值 |
| --- | --- | --- |
| `@aura/ui` | 平铺 `group: 数据展示` | `通用` / `布局` / `导航` / `表单` / `表单高级` / `数据展示` / `反馈` |
| `@aura/business` | 平铺 `group: 业务` | `业务` |
| `@aura/x` | 嵌套 `group: { title: 交互, order: 402 }` | `主题桥接` / `数据流` / `交互` / `会话` / `引导` / `推理` |

API 表格注意：类型一律反引号包裹；联合类型中的 `\|` 要转义；表格后注明继承的基础 HTML 属性。

## 6. barrel 导出（packages/<pkg>/src/index.ts）

```ts
export { Xxx } from './xxx';
export type { XxxProps, XxxRef } from './xxx';
````

组件与**全部公开类型**都要导出；内部类型不进公开 API。

## 7. 提交信息

```text
feat(ui): 新增 Skeleton 骨架屏组件
feat(x): Sender 支持 xxx
fix(business): 修复 ProTable 分页 reset
```

type 用 `feat`（新组件）/ `fix` / `perf` / `refactor` / `docs` / `test`；scope 用包短名（ui / business / x / shared…）；主题行 ≤ 100 字符，可中文。
