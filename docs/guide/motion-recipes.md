---
title: 动效场景配方
order: 9
---

# 动效场景配方

把 [`@aura-react-comp/motion`](/motion-components) 与
`@aura-react-comp/x`（AI 对话）、`@aura-react-comp/ui` / `business`（B 端）
组合成开箱即用的场景。所有配方都遵循同一条纪律：**令牌驱动 + reduced-motion 自动降级**，
复制到你的项目即可运行。

> motion 是 x 的**可选增强**——x 本身不依赖它。只在你需要动效的页面安装：
> `pnpm add @aura-react-comp/motion`。

## 配方一：AI 思考中的等待态

用 `TypingDots` 替代内置跳点，三点脉冲 + 无障碍状态（`role="status"`）。

```tsx | pure
import { Bubble } from '@aura-react-comp/x';
import { TypingDots } from '@aura-react-comp/motion';

export function ThinkingBubble() {
  return (
    <Bubble
      role="assistant"
      content=""
      contentRender={() => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <TypingDots color="#534ab7" />
          <span style={{ fontSize: 13, color: '#8a8984' }}>正在思考…</span>
        </span>
      )}
    />
  );
}
```

> 注意：`Bubble` 的 `content` 是字符串，自定义 ReactNode 请走 `contentRender`。

## 配方二：生成中的文字流光

`TextShimmer` 让「正在生成」的标题带流光——AI 产品最有辨识度的一秒。

```tsx | pure
import { TextShimmer } from '@aura-react-comp/motion';

export function GeneratingLabel() {
  return (
    <div style={{ fontSize: 15, fontWeight: 600, color: '#534ab7' }}>
      <TextShimmer duration={2} highlightColor="rgba(0,0,0,0.45)">
        正在为你生成季度报告…
      </TextShimmer>
    </div>
  );
}
```

深色背景时省略 `highlightColor`（默认白色高光）。

## 配方三：AI 卡片的流光边框

`GradientBorder` 包住回答卡片或升级入口，光带沿边框缓慢绕行——
只旋转一层 conic 渐变，性能开销极低。

```tsx | pure
import { Bubble } from '@aura-react-comp/x';
import { GradientBorder } from '@aura-react-comp/motion';

export function AiAnswerCard() {
  return (
    <GradientBorder radius={16} size={1.5} speed={4.5}>
      <Bubble role="assistant" content="这是带流光边框的 AI 回答卡片。" />
    </GradientBorder>
  );
}
```

## 配方四：落地页的滚动揭示

`ScrollScaleCard` 负责卡片随滚动从 0.9 缩放到 1 并淡入，`TiltCard` 负责
指针悬停的 3D 倾斜与光泽——两者叠加就是当代 landing 页的卡片质感。

```tsx | pure
import { ScrollScaleCard, TiltCard } from '@aura-react-comp/motion';

export function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <ScrollScaleCard from={0.92} fromOpacity={0.4}>
      <TiltCard maxTilt={6}>
        <div
          style={{
            padding: 28,
            borderRadius: 16,
            background: 'linear-gradient(145deg, #2b2a33, #1a1a1f)',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>{desc}</div>
        </div>
      </TiltCard>
    </ScrollScaleCard>
  );
}
```

## 配方五：无缝 logo 墙

`Marquee` 把内容复制两份、位移 -50% 回绕。单份内容长度要 ≥ 容器宽度。

```tsx | pure
import { Marquee } from '@aura-react-comp/motion';

const brands = ['AURA', 'MOTION', 'TOKENS', 'DESIGN', 'SYSTEM'];

export function LogoWall() {
  return (
    <Marquee duration={16} gap={40}>
      {brands.map((b) => (
        <span
          key={b}
          style={{ fontSize: 14, letterSpacing: 2, color: '#8a8984' }}
        >
          {b}
        </span>
      ))}
    </Marquee>
  );
}
```

## B 端场景（ui / business 组合）

### 配方六：仪表盘指标卡（骨架 → 数字）

数据未到达时用错峰骨架占位，到达后数字逐位滚入——避免 spinner 闪烁。

```tsx | pure
import { SkeletonShimmer, NumberTicker } from '@aura-react-comp/motion';

export function MetricCard({
  loading,
  value,
}: {
  loading: boolean;
  value: number;
}) {
  return (
    <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e8e6de' }}>
      <div style={{ fontSize: 12, color: '#8a8984', marginBottom: 8 }}>
        今日请求量
      </div>
      {loading ? (
        <SkeletonShimmer width={120} height={34} index={0} />
      ) : (
        <NumberTicker value={value} style={{ fontSize: 34, fontWeight: 600 }} />
      )}
    </div>
  );
}
```

### 配方七：ProTable 首屏骨架

ProTable 内部刷新由 antd Spin 接管；**首屏**用骨架替代白屏更有质感——
数据就绪后表格整体 Reveal 进场。

```tsx | pure
import { ProTable } from '@aura-react-comp/business';
import { Reveal, SkeletonShimmer } from '@aura-react-comp/motion';

export function UserTable({ booting, ...props }: { booting: boolean }) {
  if (booting) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonShimmer key={i} index={i} height={14} />
        ))}
      </div>
    );
  }
  return (
    <Reveal variant="fade">
      <ProTable {...props} />
    </Reveal>
  );
}
```

### 配方八：ModalForm 内容逐项进场

ModalForm 的 `destroyOnHidden` 默认为 `true`——每次打开内容都会重新挂载，
Reveal 因此每次都能完整播放（`index` 逐项错峰）。

```tsx | pure
import { ModalForm } from '@aura-react-comp/business';
import { Reveal } from '@aura-react-comp/motion';
import { Input, Select } from '@aura-react-comp/ui';

export function CreateUserModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <ModalForm open={open} title="新建用户" onOpenChange={onOpenChange}>
      <Reveal index={0}>
        <Input placeholder="姓名" />
      </Reveal>
      <Reveal index={1}>
        <Input placeholder="邮箱" />
      </Reveal>
      <Reveal index={2}>
        <Select placeholder="角色" options={[]} />
      </Reveal>
    </ModalForm>
  );
}
```

### 配方九：PageContainer 标题的文字进场

`title` 接受 ReactNode——放进 `SplitText` 即可获得遮罩升起的标题。

```tsx | pure
import { PageContainer } from '@aura-react-comp/business';
import { SplitText } from '@aura-react-comp/motion';

export function UsersPage() {
  return (
    <PageContainer
      title={
        <SplitText
          text="用户管理"
          granularity="char"
          variant="rise"
          style={{ fontSize: 20 }}
        />
      }
      description="管理所有用户与权限"
    >
      {/* 页面内容 */}
    </PageContainer>
  );
}
```

### 配方十：列表增删的自动重排

自绘任务列表用 `FlipList`：新增项淡入、删除项淡出、存量项平滑让位。

```tsx | pure
import { FlipList } from '@aura-react-comp/motion';

export function TaskList({
  tasks,
}: {
  tasks: { id: string; label: string }[];
}) {
  return (
    <FlipList
      items={tasks.map((t) => ({
        id: t.id,
        node: (
          <div
            style={{ padding: '10px 14px', borderBottom: '1px solid #f1efe8' }}
          >
            {t.label}
          </div>
        ),
      }))}
    />
  );
}
```

## 性能与可访问性清单

| 要求       | motion 的做法                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 合成器友好 | 组件只动画 `transform` / `opacity`（TextShimmer 的渐变位移与 GradientBorder 的旋转是为质感例外） |
| 减少动态   | 全部组件在 `prefers-reduced-motion` 下退化为静态呈现                                             |
| 键盘可达   | 动效不改变焦点顺序；`TypingDots` 带 `role="status"` 与「正在输入」标签                           |
| 令牌一致   | 时长 / 缓动 / 位移一律走 `--aura-motion-*` 令牌，不硬编码数值                                    |
