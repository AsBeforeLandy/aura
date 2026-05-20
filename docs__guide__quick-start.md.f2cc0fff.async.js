"use strict";(self.webpackChunkaura=self.webpackChunkaura||[]).push([[7568],{86866:function(r,t,n){n.r(t);var _=n(66898),o=n(21528),c=n(25358),x=n(39267),m=n(94823),d=n(46640),h=n(23297),p=n(67597),u=n(44381),s=n(1975),l=n(75271),a=n(24422),e=n(52676);function i(){return(0,e.jsx)(u.dY,{children:(0,e.jsx)(l.Suspense,{fallback:(0,e.jsx)(s.Z,{}),children:(0,e.jsx)(e.Fragment,{children:(0,e.jsxs)("div",{className:"markdown",children:[(0,e.jsxs)("h1",{id:"\u5FEB\u901F\u5F00\u59CB",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u5FEB\u901F\u5F00\u59CB",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u5FEB\u901F\u5F00\u59CB"]}),(0,e.jsxs)("h2",{id:"\u5B89\u88C5",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u5B89\u88C5",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u5B89\u88C5"]}),(0,e.jsx)(d.Z,{lang:"bash",children:a.texts[0].value}),(0,e.jsx)("p",{children:a.texts[1].value}),(0,e.jsx)(d.Z,{lang:"bash",children:a.texts[2].value}),(0,e.jsxs)("h2",{id:"\u57FA\u672C\u4F7F\u7528",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u57FA\u672C\u4F7F\u7528",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u57FA\u672C\u4F7F\u7528"]}),(0,e.jsx)("p",{children:a.texts[3].value}),(0,e.jsx)(d.Z,{lang:"tsx",children:a.texts[4].value}),(0,e.jsxs)("h2",{id:"\u4E3B\u9898",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u4E3B\u9898",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u4E3B\u9898"]}),(0,e.jsxs)("p",{children:[a.texts[5].value,(0,e.jsx)("strong",{children:a.texts[6].value}),a.texts[7].value,(0,e.jsx)("strong",{children:a.texts[8].value}),a.texts[9].value]}),(0,e.jsx)(d.Z,{lang:"tsx",children:a.texts[10].value}),(0,e.jsx)("p",{children:a.texts[11].value}),(0,e.jsx)(d.Z,{lang:"tsx",children:a.texts[12].value}),(0,e.jsxs)("p",{children:[a.texts[13].value,(0,e.jsx)(u.rU,{to:"/guide/theme",children:a.texts[14].value}),a.texts[15].value]}),(0,e.jsxs)("h2",{id:"typescript",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#typescript",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"TypeScript"]}),(0,e.jsx)("p",{children:a.texts[16].value}),(0,e.jsx)(d.Z,{lang:"tsx",children:a.texts[17].value}),(0,e.jsxs)("h2",{id:"\u4E0B\u4E00\u6B65",children:[(0,e.jsx)("a",{"aria-hidden":"true",tabIndex:"-1",href:"#\u4E0B\u4E00\u6B65",children:(0,e.jsx)("span",{className:"icon icon-link"})}),"\u4E0B\u4E00\u6B65"]}),(0,e.jsxs)("ul",{children:[(0,e.jsxs)("li",{children:[a.texts[18].value,(0,e.jsx)(u.rU,{to:"/components/button",children:a.texts[19].value}),a.texts[20].value]}),(0,e.jsxs)("li",{children:[a.texts[21].value,(0,e.jsx)(u.rU,{to:"/guide/theme",children:a.texts[22].value}),a.texts[23].value]}),(0,e.jsxs)("li",{children:[a.texts[24].value,(0,e.jsx)(u.rU,{to:"/changelog",children:a.texts[25].value}),a.texts[26].value]})]})]})})})})}t.default=i},24422:function(r,t,n){n.r(t),n.d(t,{texts:function(){return _}});const _=[{value:`# \u5B89\u88C5\u7EC4\u4EF6\u5E93
pnpm add @aura/ui

# \u5B89\u88C5 peer dependencies\uFF08\u5982\u679C\u5C1A\u672A\u5B89\u88C5\uFF09
pnpm add react@^18 react-dom@^18
`,paraId:0,tocIndex:1},{value:"\u5982\u679C\u9700\u8981\u989D\u5916\u7684\u5305\uFF1A",paraId:1,tocIndex:1},{value:`# \u5171\u4EAB\u5DE5\u5177\u51FD\u6570
pnpm add @aura/shared

# HTTP \u8BF7\u6C42\u5C01\u88C5
pnpm add @aura/request
`,paraId:2,tocIndex:1},{value:"\u5F15\u5165\u7EC4\u4EF6\u548C\u6837\u5F0F\u5373\u53EF\u5F00\u59CB\u4F7F\u7528\uFF1A",paraId:3,tocIndex:2},{value:`import { Button, Space } from '@aura/ui';
import '@aura/ui/src/theme/tokens.css';

const App = () => (
  <Space>
    <Button variant="primary">\u4E3B\u8981\u6309\u94AE</Button>
    <Button>\u9ED8\u8BA4\u6309\u94AE</Button>
    <Button variant="dashed">\u865A\u7EBF\u6309\u94AE</Button>
    <Button variant="link">\u94FE\u63A5\u6309\u94AE</Button>
  </Space>
);
`,paraId:4,tocIndex:2},{value:"Aura \u652F\u6301",paraId:5,tocIndex:3},{value:"\u4EAE\u8272",paraId:5,tocIndex:3},{value:"\u548C",paraId:5,tocIndex:3},{value:"\u6697\u8272",paraId:5,tocIndex:3},{value:"\u4E24\u79CD\u4E3B\u9898\u6A21\u5F0F\uFF0C\u901A\u8FC7 CSS Variables \u63A7\u5236\u3002\u4F60\u53EF\u4EE5\u624B\u52A8\u5207\u6362\uFF1A",paraId:5,tocIndex:3},{value:`// \u5207\u6362\u5230\u6697\u8272\u6A21\u5F0F
document.documentElement.setAttribute('data-theme', 'dark');

// \u5207\u6362\u5230\u4EAE\u8272\u6A21\u5F0F
document.documentElement.setAttribute('data-theme', 'light');
`,paraId:6,tocIndex:3},{value:"\u4E5F\u53EF\u4EE5\u4F7F\u7528 ThemeProvider \u8FDB\u884C\u7EC4\u4EF6\u7EA7\u63A7\u5236\uFF1A",paraId:7,tocIndex:3},{value:`import { ThemeProvider, useTheme } from '@aura/ui';

const App = () => (
  <ThemeProvider theme="dark">
    <Content />
  </ThemeProvider>
);
`,paraId:8,tocIndex:3},{value:"\u8BE6\u7EC6\u7684\u4E3B\u9898\u5B9A\u5236\u8BF4\u660E\u8BF7\u53C2\u8003 ",paraId:9,tocIndex:3},{value:"\u4E3B\u9898\u5B9A\u5236",paraId:10,tocIndex:3},{value:"\u3002",paraId:9,tocIndex:3},{value:"Aura \u4F7F\u7528 TypeScript \u7F16\u5199\uFF0C\u63D0\u4F9B\u5B8C\u6574\u7684\u7C7B\u578B\u5BFC\u51FA\uFF1A",paraId:11,tocIndex:4},{value:`import type { ButtonProps, ThemeConfig } from '@aura/ui';
`,paraId:12,tocIndex:4},{value:"\u6D4F\u89C8 ",paraId:13,tocIndex:5},{value:"\u7EC4\u4EF6\u5217\u8868",paraId:14,tocIndex:5},{value:" \u4E86\u89E3\u6240\u6709\u53EF\u7528\u7EC4\u4EF6",paraId:13,tocIndex:5},{value:"\u9605\u8BFB ",paraId:13,tocIndex:5},{value:"\u4E3B\u9898\u5B9A\u5236",paraId:15,tocIndex:5},{value:" \u4E86\u89E3\u5982\u4F55\u81EA\u5B9A\u4E49\u6837\u5F0F",paraId:13,tocIndex:5},{value:"\u67E5\u770B ",paraId:13,tocIndex:5},{value:"\u66F4\u65B0\u65E5\u5FD7",paraId:16,tocIndex:5},{value:" \u4E86\u89E3\u6700\u65B0\u53D8\u66F4",paraId:13,tocIndex:5}]}}]);
