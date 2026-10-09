import React from 'react';
import { classNames, prefixCls } from '@aura-react-comp/shared';
import './index.less';

export type FileCardStatus = 'init' | 'uploading' | 'done' | 'error';

export interface FileCardProps {
  /** 文件名（建议带扩展名，如 report.pdf） */
  name: string;
  /** 字节数；内部格式化为 B / KB / MB / GB */
  size?: number;
  /**
   * 状态：
   * - `init`：普通展示（默认）
   * - `uploading`：显示进度条与百分比
   * - `done`：成功态
   * - `error`：失败态，显示 errorTip
   */
  status?: FileCardStatus;
  /** `status="uploading"` 时的进度（0–100，越界会自动钳制） */
  percent?: number;
  /** 文件描述，显示在元信息下方 */
  description?: React.ReactNode;
  /** 失败原因；`status="error"` 时替代 description 显示 */
  errorTip?: React.ReactNode;
  /** 自定义图标；缺省渲染内置文件图标 */
  icon?: React.ReactNode;
  /** 移除按钮；不传则不渲染 */
  onRemove?: (name: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** 字节数 → 人类可读字符串（B 取整，其余保留一位小数） */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1,
  );
  const value = bytes / 1024 ** exp;
  return `${exp === 0 ? Math.round(value) : value.toFixed(1)} ${SIZE_UNITS[exp]}`;
}

/** 取小写扩展名；无扩展名返回空串 */
export function getFileExt(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase();
}

const clampPercent = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

/** 内置文件图标（继承 currentColor） */
const FileGlyph: React.FC = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M11.5 2.5H5.5A1.5 1.5 0 0 0 4 4v12a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 16V7l-4.5-4.5Z" />
    <path d="M11.5 2.5V7H16" />
  </svg>
);

/**
 * FileCard — 文件卡片。
 *
 * 附件列表、引用文件、上传结果的基本展示单元：图标、文件名、大小、
 * 扩展名徽标与状态（上传进度 / 完成 / 失败）。通常配合
 * [`Attachments`](/x-components/attachments) 组成输入框上方的附件条。
 */
export const FileCard: React.FC<FileCardProps> = ({
  name,
  size,
  status = 'init',
  percent,
  description,
  errorTip,
  icon,
  onRemove,
  className,
  style,
}) => {
  const ext = getFileExt(name);
  const clamped = clampPercent(percent ?? 0);
  const showProgress = status === 'uploading' && percent !== undefined;

  return (
    <div
      className={classNames(
        prefixCls('x-file-card'),
        status !== 'init' && prefixCls(`x-file-card--${status}`),
        className,
      )}
      style={style}
    >
      <span className={prefixCls('x-file-card-icon')} aria-hidden="true">
        {icon ?? <FileGlyph />}
      </span>
      <div className={prefixCls('x-file-card-body')}>
        <div className={prefixCls('x-file-card-main')}>
          <span className={prefixCls('x-file-card-name')} title={name}>
            {name}
          </span>
          {status === 'done' ? (
            <span className={prefixCls('x-file-card-check')} aria-hidden="true">
              ✓
            </span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className={prefixCls('x-file-card-remove')}
              aria-label={`移除 ${name}`}
              onClick={() => onRemove(name)}
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
        <div className={prefixCls('x-file-card-meta')}>
          {size !== undefined ? (
            <span className={prefixCls('x-file-card-size')}>
              {formatFileSize(size)}
            </span>
          ) : null}
          {ext ? (
            <span className={prefixCls('x-file-card-ext')}>{ext}</span>
          ) : null}
          {showProgress ? (
            <span className={prefixCls('x-file-card-percent')}>{clamped}%</span>
          ) : null}
        </div>
        {showProgress ? (
          <div
            className={prefixCls('x-file-card-progress')}
            role="progressbar"
            aria-label={`${name} 上传进度`}
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={prefixCls('x-file-card-progress-bar')}
              style={{ width: `${clamped}%` }}
            />
          </div>
        ) : null}
        {status === 'error' && errorTip ? (
          <div className={prefixCls('x-file-card-error-tip')}>{errorTip}</div>
        ) : description ? (
          <div className={prefixCls('x-file-card-desc')}>{description}</div>
        ) : null}
      </div>
    </div>
  );
};

FileCard.displayName = 'FileCard';
