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

// size 默认 24（px），按需显式传入
<Search size={16} />
// color 默认 currentColor，不传即继承父级文本颜色
<StarFilled color="#f59e0b" />
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `size` | 图标尺寸（px，同时作用于宽高） | `number` | `24` |
| `color` | 图标颜色 | `string` | `'currentColor'` |
| `className` | 附加 CSS 类名 | `string` | - |
| `style` | 行内样式 | `CSSProperties` | - |

TwoTone 形态的图标额外支持 `twoToneColor` 指定辅色。

## 图标分组

`status` · `navigation` · `action` · `general` · `file` · `result` · `empty` · `star`

完整清单与在线预览见文档站「组件 → Icon 图标」。

## 说明

- `react` / `react-dom` 为 peerDependencies，由使用方提供。
- 可被 tree-shaking（`sideEffects: false`），按需引入单个图标即可。

## 许可证

MIT
