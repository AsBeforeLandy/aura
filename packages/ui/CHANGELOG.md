# @aura-react-comp/ui

## 0.1.1

### Patch Changes

- 4a7f087: - **Pagination**：「每页条数」选择器改用组件库自己的 `Select`。此前的原生 `<select>`
  下拉面板由浏览器绘制（跟随系统外观），与整体视觉割裂；现在与其它表单控件完全一致，
  尺寸随 Pagination 的 `size` 联动（md 32px / sm 28px）。
  - **Select**：修复 `size` prop 无效的问题——`sm` / `lg` 的类名此前已输出但样式缺失，
    现补齐 selector 高度、内边距、字号、圆角与下拉选项密度。
