import React, { useEffect, useState, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { classNames, prefixCls } from '@aura/shared';
import { CheckCircleFilled, CloseCircleFilled, WarningTriangleFilled, InfoCircleFilled, Close } from '@aura/icons';
import './index.less';

/* ===== 类型定义 ===== */
type NotificationVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface NotificationOptions {
  /** 通知标题，支持任意 ReactNode */
  title?: React.ReactNode;
  /** 通知内容（必填），支持任意 ReactNode */
  content: React.ReactNode;
  /** 唯一标识；重复调用同 key 会原位更新（不重新弹出新通知），并重置自动关闭计时 */
  key?: string;
  /** 自动关闭延时（毫秒）；0 表示不自动关闭 */
  duration?: number;
  /** 通知类型 */
  variant?: NotificationVariant;
  /** 弹出位置 */
  placement?: NotificationPlacement;
  /** 底部操作区（按钮组等） */
  actions?: React.ReactNode;
  /** 关闭回调（自动关闭 / 手动关闭 / destroy 均触发） */
  onClose?: () => void;
}

interface NotificationItem
  extends Omit<NotificationOptions, 'duration'> {
  key: string;
  _placement: NotificationPlacement;
  /** 实际生效时长；null = 不自动关闭 */
  duration: number | null;
  /** 每次同 key 更新时自增，用于重置自动关闭计时器 */
  version: number;
}

/* ===== 图标 ===== */
const variantIcons: Record<NotificationVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircleFilled size={18} />,
  error: <CloseCircleFilled size={18} />,
  warning: <WarningTriangleFilled size={18} />,
  info: <InfoCircleFilled size={18} />,
};

/* ===== 容器管理 ===== */
const containers: Map<string, { el: HTMLDivElement; root: Root }> = new Map();
let notificationList: NotificationItem[] = [];
let notificationKeyCounter = 0;

function getContainer(placement: NotificationPlacement) {
  const existing = containers.get(placement);
  if (existing) return existing;

  const el = document.createElement('div');
  el.className = classNames(
    prefixCls('notification-container'),
    prefixCls(`notification-container-${placement}`),
  );
  document.body.appendChild(el);
  const root = createRoot(el);
  containers.set(placement, { el, root });
  return { el, root };
}

function renderNotifications() {
  // 按 placement 分组渲染
  const groups: Map<NotificationPlacement, NotificationItem[]> = new Map();
  notificationList.forEach((item) => {
    const placement = item._placement;
    if (!groups.has(placement)) groups.set(placement, []);
    groups.get(placement)!.push(item);
  });

  // 渲染有内容的容器
  groups.forEach((items, placement) => {
    const { root } = getContainer(placement);
    flushSync(() => {
      root.render(<NotificationList items={items} />);
    });
  });

  // 清理空容器
  containers.forEach((container, placement) => {
    const p = placement as NotificationPlacement;
    if (!groups.has(p)) {
      setTimeout(() => {
        if (!notificationList.some((n) => n._placement === p)) {
          container.root.unmount();
          if (container.el.parentNode) {
            document.body.removeChild(container.el);
          }
          containers.delete(p);
        }
      }, 400);
    }
  });
}

function addNotification(options: NotificationOptions & { _variantOverride?: NotificationVariant }) {
  const variant = options._variantOverride ?? options.variant ?? 'default';
  const placement = options.placement ?? 'topRight';
  // 显式传 0 / 负数视为不自动关闭
  const duration =
    options.duration !== undefined && options.duration > 0
      ? options.duration
      : options.duration !== undefined
        ? null
        : 4500;

  const existingIndex = options.key
    ? notificationList.findIndex((n) => n.key === options.key)
    : -1;

  const item: NotificationItem = {
    ...options,
    key: options.key ?? `aura-notify-${++notificationKeyCounter}`,
    variant,
    _placement: placement,
    duration,
    version: existingIndex >= 0 ? notificationList[existingIndex].version + 1 : 0,
  };

  if (existingIndex >= 0) {
    // 同 key 原位更新：保持通知在列表中的位置，不重新播放入场动画
    notificationList = notificationList.map((existing, i) =>
      i === existingIndex ? item : existing,
    );
  } else {
    notificationList = [...notificationList, item];
  }
  renderNotifications();
}

function removeNotification(key: string) {
  const item = notificationList.find((n) => n.key === key);
  notificationList = notificationList.filter((n) => n.key !== key);
  renderNotifications();
  if (item?.onClose) item.onClose();
}

function destroyNotifications(key?: string) {
  if (key === undefined) {
    const keys = notificationList.map((n) => n.key);
    keys.forEach(removeNotification);
    return;
  }
  removeNotification(key);
}

/* ===== NotificationList 组件 ===== */
const NotificationList: React.FC<{ items: NotificationItem[] }> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <NotificationItemComponent
          key={item.key}
          item={item}
          onClose={() => removeNotification(item.key)}
        />
      ))}
    </>
  );
};

/* ===== 单条通知组件 ===== */
const NotificationItemComponent: React.FC<{
  item: NotificationItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (item.duration != null && item.duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, item.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.duration, item.version]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  };

  const cls = classNames(
    prefixCls('notification'),
    prefixCls(`notification-${item.variant ?? 'default'}`),
    visible && !leaving && prefixCls('notification-visible'),
    leaving && prefixCls('notification-leaving'),
  );

  return (
    <div className={cls}>
      {/* 左侧图标 */}
      {item.variant && item.variant !== 'default' && (
        <span className={prefixCls('notification-icon')}>
          {variantIcons[item.variant]}
        </span>
      )}
      {/* 内容 */}
      <div className={prefixCls('notification-body')}>
        {item.title && (
          <div className={prefixCls('notification-title')}>{item.title}</div>
        )}
        <div className={prefixCls('notification-content')}>{item.content}</div>
        {/* 底部操作区 */}
        {item.actions && (
          <div className={prefixCls('notification-actions')}>{item.actions}</div>
        )}
      </div>
      {/* 关闭按钮 */}
      <button
        type="button"
        className={prefixCls('notification-close')}
        onClick={handleClose}
        aria-label="关闭"
      >
        <Close size={14} />
      </button>
    </div>
  );
};

/* ===== 重置内部状态（供测试使用） ===== */
export function _resetNotificationState() {
  notificationList = [];
  containers.forEach((container) => {
    container.root.unmount();
    if (container.el.parentNode) {
      container.el.parentNode.removeChild(container.el);
    }
  });
  containers.clear();
}

/* ===== 对外导出 ===== */
export interface NotificationApi {
  open(options: NotificationOptions): void;
  success(options: Omit<NotificationOptions, 'variant'>): void;
  error(options: Omit<NotificationOptions, 'variant'>): void;
  warning(options: Omit<NotificationOptions, 'variant'>): void;
  info(options: Omit<NotificationOptions, 'variant'>): void;
  /** 关闭指定通知；不传 key 关闭全部 */
  destroy(key?: string): void;
}

export const notification: NotificationApi = {
  open: (options) => addNotification(options),
  success: (options) => addNotification({ ...options, _variantOverride: 'success' }),
  error: (options) => addNotification({ ...options, _variantOverride: 'error' }),
  warning: (options) => addNotification({ ...options, _variantOverride: 'warning' }),
  info: (options) => addNotification({ ...options, _variantOverride: 'info' }),
  destroy: (key) => destroyNotifications(key),
};

export default notification;
