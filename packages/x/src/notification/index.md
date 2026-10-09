---
title: XNotification
subtitle: 系统通知
group:
  title: 数据流
  order: 401
category: Components
description: 浏览器系统级通知的命令式 API（window.Notification 封装）与 useNotification Hook，受操作系统通知权限管控。
order: 3
toc: content
---

# XNotification 系统通知

## 何时使用

- 智能体在后台执行长任务，需要把「任务已完成」推到**页面之外**让用户随时掌握；
- 仅用于弱通知场景：用户可以忽略，不该承载必须确认的信息。

## 与页面内通知的区别

`XNotification` 走 `window.Notification`，弹出的是**操作系统 / 浏览器级别的系统通知**，
受通知权限管控，且样式由浏览器与操作系统决定，组件无法干预。

需要页面内的消息条 / 通知卡片，请用 `@aura-react-comp/ui` 的 `Notification` 与 `Message`。

## 代码演示

### Hooks 调用

发送前需先向用户请求权限；授权后才能推送。

<code src="./demo/hooks.tsx" description="请求权限 → 推送通知 → 按 tag 关闭或全部关闭。">权限与推送</code>

## API

### XNotification

| 属性              | 说明                                                        | 类型                                     |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------- |
| permission        | 当前授权状态（实时读取）                                    | `'granted' \| 'denied' \| 'default'`     |
| requestPermission | 请求通知权限                                                | `() => Promise<XNotificationPermission>` |
| open              | 推送一条通知                                                | `(args: XNotificationOpenArgs) => void`  |
| close             | 关闭通知：传 tag 列表只关指定的，不传则关闭本实例发出的全部 | `(tags?: string[]) => void`              |

### XNotificationConfig

继承浏览器的 `NotificationOptions`（`body` / `icon` / `tag` / `silent` / `requireInteraction` 等），另加：

| 参数                       | 说明                                   | 类型                                        | 默认值 |
| -------------------------- | -------------------------------------- | ------------------------------------------- | ------ |
| title                      | 通知标题（浏览器无默认值，必填）       | `string`                                    | -      |
| duration                   | 自动关闭延时（毫秒）；不传则不自动关闭 | `number`                                    | -      |
| onClick                    | 点击通知；第二个参数可直接关闭本条     | `(event: Event, close: () => void) => void` | -      |
| onShow / onClose / onError | 展示 / 关闭 / 出错回调                 | `(event: Event) => void`                    | -      |

`open` 同时接受 antdx 风格的包装形态：`{ openConfig, closeConfig }`，
其中 `closeConfig` 用于在弹出新通知前先关掉指定 `tag` 的旧通知。

### useNotification

返回元组 `[{ permission }, { open, close, requestPermission }]`，签名与
`XNotification` 一致，只是把 `permission` 变成可跟踪的 React 状态。

## 注意事项

- **系统通知权限被关闭时，`open` 调用不会产生任何效果**（浏览器直接忽略），
  组件层也刻意保持静默——不要在业务里依赖它作为「成功提示」。
- 环境不支持 `window.Notification`（服务端渲染、部分 WebView）时全部方法为
  no-op，`permission` 返回 `'denied'`；原生构造函数是**调用时**才去取的，
  因此模块本身可以安全地在 SSR 中 import。
- `permission` 首帧固定为 `'denied'`，挂载后才同步真实值，以避免水合不一致；
  需要首帧即准确时请自行在 `useEffect` 之后读取。
- `close()` 只能管理**当前实例**发出的通知（模块内的 `Map` 记录）；
  页面刷新后对已弹出的系统通知无管理能力，这是浏览器 API 的固有限制。
