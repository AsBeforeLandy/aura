import { useCallback, useEffect, useMemo, useState } from 'react';

/** 当前来源（origin）的浏览器通知授权状态 */
export type XNotificationPermission = NotificationPermission;

export interface XNotificationConfig extends NotificationOptions {
  /** 通知标题（浏览器不提供默认值，必填） */
  title: string;
  /** 自动关闭延时（毫秒）；不传或非正数则不自动关闭 */
  duration?: number;
  /** 点击通知；第二个参数可直接关闭本条通知 */
  onClick?: (event: Event, close: () => void) => void;
  onClose?: (event: Event) => void;
  onError?: (event: Event) => void;
  onShow?: (event: Event) => void;
}

/**
 * `open` 的参数：既接受扁平的 {@link XNotificationConfig}，
 * 也接受 antdx 风格的 `{ openConfig, closeConfig }` 包装形态。
 * `closeConfig` 用于在弹出新通知前先关掉指定 `tag` 的旧通知。
 */
export type XNotificationOpenArgs =
  | XNotificationConfig
  | {
      openConfig: XNotificationConfig;
      /** 先关闭这些 tag 的通知（`undefined` 项会被忽略） */
      closeConfig?: (string | undefined)[];
    };

export interface XNotificationApi {
  /** 当前授权状态；每次读取都向浏览器取实时值 */
  readonly permission: XNotificationPermission;
  /** 向用户请求通知权限 */
  requestPermission: () => Promise<XNotificationPermission>;
  /** 推送一条通知；未授权或环境不支持时静默无效果 */
  open: (args: XNotificationOpenArgs) => void;
  /** 关闭通知：传 tag 列表只关指定的，不传则关闭本实例发出的全部 */
  close: (tags?: string[]) => void;
}

export type UseNotificationResult = [
  { permission: XNotificationPermission },
  {
    open: XNotificationApi['open'];
    close: XNotificationApi['close'];
    requestPermission: XNotificationApi['requestPermission'];
  },
];

/** 懒取原生构造函数：模块加载期不触碰 `window`，SSR 与 jsdom 都安全 */
function getNative(): typeof Notification | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { Notification?: typeof Notification }).Notification;
}

/** 未授权 / 环境不支持时的统一返回值（antdx 同样以 `denied` 兜底） */
function currentPermission(): XNotificationPermission {
  const Native = getNative();
  return Native ? Native.permission : 'denied';
}

/** 本模块发出的通知，按 tag 索引；未传 tag 的用内部序号占位 */
const opened = new Map<string, Notification>();
let seq = 0;

function closeByTags(tags?: string[]): void {
  if (!getNative()) return;

  if (!tags || tags.length === 0) {
    opened.forEach((instance) => instance.close());
    opened.clear();
    return;
  }

  for (const tag of tags) {
    const instance = opened.get(tag);
    if (instance) {
      instance.close();
      opened.delete(tag);
    }
  }
}

function requestPermission(): Promise<XNotificationPermission> {
  const Native = getNative();
  if (!Native) return Promise.resolve('denied');
  try {
    return Promise.resolve(Native.requestPermission());
  } catch {
    // 部分环境（非安全上下文 / 权限策略禁用）会直接抛错
    return Promise.resolve('denied');
  }
}

const isWrapped = (
  args: XNotificationOpenArgs,
): args is { openConfig: XNotificationConfig; closeConfig?: (string | undefined)[] } =>
  'openConfig' in args;

function open(args: XNotificationOpenArgs): void {
  const Native = getNative();
  // 环境不支持（如 SSR、部分 WebView）→ 静默无效果
  if (!Native) return;

  const { openConfig, closeConfig } = isWrapped(args)
    ? { openConfig: args.openConfig, closeConfig: args.closeConfig }
    : { openConfig: args, closeConfig: undefined };

  // 未授权时不弹（浏览器同样会忽略），并避免让调用方以为已生效
  if (Native.permission !== 'granted') return;

  if (closeConfig?.length) {
    closeByTags(closeConfig.filter((tag): tag is string => Boolean(tag)));
  }

  const {
    title,
    duration,
    onClick,
    onClose,
    onError,
    onShow,
    ...rest
  } = openConfig;

  let instance: Notification;
  try {
    instance = new Native(title, rest);
  } catch {
    // title 为空等非法参数：不抛出，避免打断调用方的业务流程
    return;
  }

  const key = rest.tag ?? `__aura_x_${seq++}`;
  opened.set(key, instance);

  instance.onclick = (event) => onClick?.(event, () => closeByTags([key]));
  instance.onshow = (event) => onShow?.(event);
  instance.onclose = (event) => {
    opened.delete(key);
    onClose?.(event);
  };
  instance.onerror = (event) => {
    opened.delete(key);
    onError?.(event);
  };

  if (typeof duration === 'number' && duration > 0) {
    setTimeout(() => {
      instance.close();
      opened.delete(key);
    }, duration);
  }
}

/**
 * XNotification — 浏览器**系统通知**的命令式 API（对标 antdx 的 `notification`）。
 *
 * 注意这是「页面外的系统级通知」，走 `window.Notification`，受操作系统与浏览器
 * 通知权限管控——**不是**页面内的消息条。页面内的提示请用 `@aura-react-comp/ui` 的
 * `Notification` / `Message`。
 */
export const XNotification: XNotificationApi = {
  get permission() {
    return currentPermission();
  },
  requestPermission,
  open,
  close: closeByTags,
};

/**
 * useNotification — `XNotification` 的 Hook 形态。
 *
 * 返回 `[{ permission }, { open, close, requestPermission }]`。
 * `permission` 首帧固定为 `'denied'`，挂载后（`useEffect` 中）再同步真实值，
 * 以避免服务端渲染与水合结果不一致。
 */
export function useNotification(): UseNotificationResult {
  const [permission, setPermission] = useState<XNotificationPermission>('denied');

  useEffect(() => {
    setPermission(currentPermission());
  }, []);

  const request = useCallback(async () => {
    const next = await requestPermission();
    setPermission(next);
    return next;
  }, []);

  return useMemo(
    () => [
      { permission },
      { open, close: closeByTags, requestPermission: request },
    ],
    [permission, request],
  );
}
