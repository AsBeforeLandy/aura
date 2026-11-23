---
'@aura-react-comp/design': patch
'@aura-react-comp/business': patch
'@aura-react-comp/x': patch
'@aura-react-comp/motion': patch
'@aura-react-comp/charts': patch
'@aura-react-comp/charts-3d': patch
'@aura-react-comp/editor': patch
'@aura-react-comp/icons': patch
'@aura-react-comp/shared': patch
'@aura-react-comp/request': patch
---

fix: 声明文件相对引用补全扩展名，修复 moduleResolution node16/nodenext（含 TS 6 默认配置）下导出解析失败的问题——此前 skipLibCheck: true 时导出静默降级为 any，skipLibCheck: false 时报 TS2834/TS2835。
