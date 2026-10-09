import React, { useEffect, useState, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import { CheckCircleFilled, CloseCircleFilled, WarningTriangleFilled, InfoCircleFilled, Loading } from '@aura-react-comp/icons';
import './index.less';

/* ===== 类型定义 ===== */
type MessageVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface MessageArgs {
  /** 消息内容，支持任意 ReactNode（链接、按钮等） */
  content: React.ReactNode;
  /** 唯一标识；重复调用同 key 会原位更新内容与变体（loading → success 场景），不重新播放入场动画 */
  key?: string;
  /** 自动关闭延时（毫秒）；0 表示不自动关闭 */
  duration?: number;
  /** 自定义图标，覆盖变体默认图标 */
  icon?: React.ReactNode;
  /** 消息关闭（自动关闭 / destroy）后的回调 */
  onClose?: () => void;
}

interface MessageItem extends Omit<MessageArgs, 'duration'> {
  key: string;
  variant: MessageVariant;
  duration: number | null; // null = 不自动关闭
  /** 每次同 key 更新时自增，用于重置自动关闭计时器 */
  version: number;
}

/* ===== 图标 ===== */
const variantIcons: Record<MessageVariant, React.ReactNode> = {
  success: <CheckCircleFilled size={16} />,
  error: <CloseCircleFilled size={16} />,
  warning: <WarningTriangleFilled size={16} />,
  info: <InfoCircleFilled size={16} />,
  loading: <Loading size={16} className={prefixCls('message-loading-icon')} />,
};

/* ===== 容器管理 ===== */
let containerEl: HTMLDivElement | null = null;
let rootInstance: Root | null = null;
let messageList: MessageItem[] = [];
let messageKeyCounter = 0;

function getContainer(): HTMLDivElement {
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.className = prefixCls('message-container');
    document.body.appendChild(containerEl);
    rootInstance = createRoot(containerEl);
  }
  return containerEl;
}

function renderMessages() {
  getContainer();
  if (rootInstance) {
    const root = rootInstance;
    flushSync(() => {
      root.render(<MessageList items={messageList} />);
    });
  }
  // 无消息时卸载容器
  if (messageList.length === 0 && rootInstance) {
    setTimeout(() => {
      if (messageList.length === 0 && containerEl && rootInstance) {
        rootInstance.unmount();
        document.body.removeChild(containerEl);
        containerEl = null;
        rootInstance = null;
      }
    }, 300);
  }
}

/** 解析调用参数：首参可以是纯内容（string / number / ReactElement），也可以是完整 MessageArgs */
function resolveArgs(
  args: React.ReactNode | MessageArgs,
  duration?: number,
): MessageArgs {
  if (
    args !== null &&
    typeof args === 'object' &&
    !React.isValidElement(args) &&
    'content' in args
  ) {
    const config = args as MessageArgs;
    return { ...config, duration: config.duration ?? duration };
  }
  return { content: args as React.ReactNode, duration };
}

function addMessage(
  variant: MessageVariant,
  args: React.ReactNode | MessageArgs,
  duration?: number,
) {
  const resolved = resolveArgs(args, duration);
  // 显式传 0 / 负数视为不自动关闭；loading 默认不自动关闭
  const effectiveDuration =
    resolved.duration !== undefined
      ? resolved.duration > 0
        ? resolved.duration
        : null
      : variant === 'loading'
        ? null
        : 3000;

  const existingIndex = resolved.key
    ? messageList.findIndex((item) => item.key === resolved.key)
    : -1;

  const item: MessageItem = {
    ...resolved,
    key: resolved.key ?? `aura-msg-${++messageKeyCounter}`,
    variant,
    duration: effectiveDuration,
    version: existingIndex >= 0 ? messageList[existingIndex].version + 1 : 0,
  };

  if (existingIndex >= 0) {
    // 同 key 原位更新：保持消息在列表中的位置，不重新播放入场动画
    messageList = messageList.map((existing, i) =>
      i === existingIndex ? item : existing,
    );
  } else {
    messageList = [...messageList, item];
  }
  renderMessages();
}

function removeMessage(key: string) {
  const item = messageList.find((m) => m.key === key);
  messageList = messageList.filter((m) => m.key !== key);
  renderMessages();
  if (item?.onClose) item.onClose();
}

/* ===== MessageList 组件 ===== */
const MessageList: React.FC<{ items: MessageItem[] }> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <MessageItemComponent
          key={item.key}
          item={item}
          onClose={() => removeMessage(item.key)}
        />
      ))}
    </>
  );
};

/* ===== 单条消息组件 ===== */
const MessageItemComponent: React.FC<{
  item: MessageItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 入场动画：下一帧设置 visible
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (item.duration !== null && item.duration > 0) {
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
    prefixCls('message'),
    prefixCls(`message-${item.variant}`),
    visible && !leaving && prefixCls('message-visible'),
    leaving && prefixCls('message-leaving'),
  );

  return (
    <div className={cls} role="status">
      <span className={prefixCls('message-icon')}>
        {item.icon ?? variantIcons[item.variant]}
      </span>
      <span className={prefixCls('message-content')}>{item.content}</span>
    </div>
  );
};

/* ===== 重置内部状态（供测试使用） ===== */
export function _resetMessageState() {
  messageList = [];
  if (rootInstance) {
    rootInstance.unmount();
  }
  if (containerEl && containerEl.parentNode) {
    containerEl.parentNode.removeChild(containerEl);
  }
  containerEl = null;
  rootInstance = null;
}

/* ===== 对外导出 ===== */
/** 首参：纯内容或完整参数对象 */
export type MessageContent = React.ReactNode | MessageArgs;

export interface MessageApi {
  success(content: MessageContent, duration?: number): void;
  error(content: MessageContent, duration?: number): void;
  warning(content: MessageContent, duration?: number): void;
  info(content: MessageContent, duration?: number): void;
  loading(content: MessageContent, duration?: number): void;
  /** 完整参数打开消息，变体由 variant 指定（缺省 info） */
  open(
    args: Omit<MessageArgs, 'key'> & { key?: string; variant?: MessageVariant },
  ): void;
  /** 关闭指定消息；不传 key 关闭全部 */
  destroy(key?: string): void;
}

export const message: MessageApi = {
  success: (content, duration) => addMessage('success', content, duration),
  error: (content, duration) => addMessage('error', content, duration),
  warning: (content, duration) => addMessage('warning', content, duration),
  info: (content, duration) => addMessage('info', content, duration),
  loading: (content, duration) => addMessage('loading', content, duration),
  open: (args) => addMessage(args.variant ?? 'info', args),
  destroy: (key) => {
    if (key === undefined) {
      const keys = messageList.map((item) => item.key);
      keys.forEach(removeMessage);
      return;
    }
    removeMessage(key);
  },
};

export default message;
