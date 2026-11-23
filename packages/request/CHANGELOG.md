# @aura-react-comp/request

## 0.1.1

### Patch Changes

- f820ac7: fix: 声明文件相对引用补全扩展名，修复 moduleResolution node16/nodenext（含 TS 6 默认配置）下导出解析失败的问题——此前 skipLibCheck: true 时导出静默降级为 any，skipLibCheck: false 时报 TS2834/TS2835。
- Updated dependencies [f820ac7]
  - @aura-react-comp/shared@0.1.1
