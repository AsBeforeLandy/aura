import React, { useEffect, useState, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { classNames, prefixCls } from '@aura/shared';
import { CheckCircleFilled, CloseCircleFilled, WarningTriangleFilled, InfoCircleFilled, Loading } from '@aura/icons';
import './index.less';

/* ===== 类型定义 ===== */
type MessageVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface MessageItem {
  key: string;
  content: string;
  variant: MessageVariant;
  duration: number | null; // null = 不自动关闭
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
  const container = getContainer();
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

function addMessage(variant: MessageVariant, content: string, duration?: number) {
  const key = `aura-msg-${++messageKeyCounter}`;
  const effectiveDuration =
    duration !== undefined
      ? duration
      : variant === 'loading'
        ? null // loading 默认不自动关闭
        : 3000;

  messageList = [...messageList, { key, content, variant, duration: effectiveDuration }];
  renderMessages();
}

function removeMessage(key: string) {
  messageList = messageList.filter((item) => item.key !== key);
  renderMessages();
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
  }, [item.duration]);

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
    <div className={cls}>
      <span className={prefixCls('message-icon')}>{variantIcons[item.variant]}</span>
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
export interface MessageApi {
  success(content: string, duration?: number): void;
  error(content: string, duration?: number): void;
  warning(content: string, duration?: number): void;
  info(content: string, duration?: number): void;
  loading(content: string, duration?: number): void;
}

export const message: MessageApi = {
  success: (content, duration) => addMessage('success', content, duration),
  error: (content, duration) => addMessage('error', content, duration),
  warning: (content, duration) => addMessage('warning', content, duration),
  info: (content, duration) => addMessage('info', content, duration),
  loading: (content, duration) => addMessage('loading', content, duration),
};

export default message;
