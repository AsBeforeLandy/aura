import React from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { FileCard } from '../file-card';
import type { FileCardStatus } from '../file-card';
import './index.less';

export interface AttachmentItem {
  /** 唯一键（同时作为 React key） */
  id: React.Key;
  name: string;
  /** 字节数 */
  size?: number;
  status?: FileCardStatus;
  /** `status="uploading"` 时的进度（0–100） */
  percent?: number;
  description?: React.ReactNode;
  /** 失败原因 */
  errorTip?: React.ReactNode;
  /** 原始 File 对象，随 onRemove 回调透传 */
  file?: File;
}

export interface AttachmentsProps {
  items: AttachmentItem[];
  /** 移除回调：回传被移除的项与其索引 */
  onRemove?: (item: AttachmentItem, index: number) => void;
  /**
   * 溢出模式：
   * - `wrap`：换行排列（默认）
   * - `scrollX`：单行横向滚动，超出容器宽度可滑动
   * @default 'wrap'
   */
  overflow?: 'wrap' | 'scrollX';
  /** 空列表占位；缺省渲染 null */
  empty?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Attachments — 附件列表。
 *
 * 输入框（`Sender` 的 `header` 插槽）上方的附件条：把待发送的文件
 * 以 [`FileCard`](/x-components/file-card) 形态横向排布，支持移除与
 * 上传进度。语义为 `role="list"`，每张卡片是一个 `listitem`。
 */
export const Attachments: React.FC<AttachmentsProps> = ({
  items,
  onRemove,
  overflow = 'wrap',
  empty,
  className,
  style,
}) => {
  if (items.length === 0) {
    if (!empty) return null;
    return (
      <div
        className={classNames(
          prefixCls('x-attachments'),
          prefixCls('x-attachments--empty'),
          className,
        )}
        style={style}
      >
        {empty}
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="附件列表"
      className={classNames(
        prefixCls('x-attachments'),
        overflow === 'scrollX' && prefixCls('x-attachments--scroll-x'),
        className,
      )}
      style={style}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="listitem"
          className={prefixCls('x-attachments-item')}
        >
          <FileCard
            name={item.name}
            size={item.size}
            status={item.status}
            percent={item.percent}
            description={item.description}
            errorTip={item.errorTip}
            onRemove={onRemove ? () => onRemove(item, index) : undefined}
          />
        </div>
      ))}
    </div>
  );
};

Attachments.displayName = 'Attachments';
