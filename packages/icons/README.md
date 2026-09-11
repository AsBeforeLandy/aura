# @aura/icons

Aura 图标库：一组无外部依赖的矢量图标 React 组件。

覆盖状态提示、导航、操作、文件、结果页、空状态、评分等中后台常见场景。

## 安装

```bash
pnpm add @aura/icons
```

## 使用

```tsx
import { CheckCircleFilled, Search, StarFilled } from '@aura/icons';

// 尺寸跟随父级字号（默认 1em），颜色跟随 currentColor
<Search size={16} />
<StarFilled color="#f59e0b" />
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `size` | 图标尺寸 | `number \| string` | `1em` |
| `color` | 图标颜色 | `string` | 继承 `currentColor` |
| `spin` | 是否旋转（加载态） | `boolean` | `false` |
| `className` | 自定义类名 | `string` | - |
| `style` | 自定义样式 | `CSSProperties` | - |

TwoTone 形态的图标额外支持 `twoToneColor` 指定主色。

## 图标分组

`status` · `navigation` · `action` · `general` · `file` · `result` · `empty` · `star`

完整清单与在线预览见文档站「组件 → Icon 图标」。

## 说明

- `react` / `react-dom` 为 peerDependencies，由使用方提供。
- 可被 tree-shaking（`sideEffects: false`），按需引入单个图标即可。

## 许可证

MIT
