import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { Uploading, CheckCircleFilled, CloseCircleFilled, Close, Upload as UploadIcon, CloudUpload, PicturePlaceholder } from '@aura/icons';
import { requestUpload } from './request';
import './index.less';

/* ===== 类型定义 ===== */

export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  file?: File;
}

/** 自定义上传的参数：通过 onSuccess / onError 回报上传结果 */
export interface CustomRequestOptions {
  file: File;
  action?: string;
  headers?: Record<string, string>;
  onSuccess: (body?: unknown) => void;
  onError: (error: Error) => void;
}

export interface UploadProps {
  /** 接受的文件类型 */
  accept?: string;
  /** 是否支持多选 */
  multiple?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 文件大小上限（bytes） */
  maxSize?: number;
  /** 最多可上传的文件数量；为 1 时新选择的文件直接替换 */
  maxCount?: number;
  /** 文件列表展示风格
   *  @default 'text'
   */
  listType?: 'text' | 'picture' | 'picture-card';
  /** 受控文件列表（编辑页回显）；传入后组件不自改状态，更新请以 onChange 返回的列表为准 */
  fileList?: UploadFile[];
  /** 默认文件列表（非受控） */
  defaultFileList?: UploadFile[];
  /**
   * 上传接口地址。
   * 配置后选择文件即发起真实 POST（multipart/form-data，字段名 `file`），
   * 成功置为 `done`、失败置为 `error`；不配置则保持本地模拟流程。
   */
  action?: string;
  /** 随上传请求附加的请求头（仅在配置了 `action` 时生效） */
  headers?: Record<string, string>;
  /** 文件列表变化回调 */
  onChange?: (fileList: UploadFile[]) => void;
  /** 上传前钩子，返回 false 阻止上传 */
  beforeUpload?: (file: File) => boolean | Promise<File>;
  /** 点击移除前的钩子，返回 false 阻止移除 */
  onRemove?: (file: UploadFile) => boolean | void | Promise<boolean | void>;
  /** 点击文件名（预览）回调 */
  onPreview?: (file: UploadFile) => void;
  /** 自定义上传实现；配置后忽略 action 的内置请求，通过 onSuccess / onError 回报状态 */
  customRequest?: (options: CustomRequestOptions) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/* ===== 工具函数 ===== */

let uidCounter = 0;
function generateUid(): string {
  return `aura-upload-${Date.now()}-${++uidCounter}`;
}

/** 状态图标 */
const StatusIcon: React.FC<{ status: UploadFile['status'] }> = ({ status }) => {
  if (status === 'uploading') {
    return <Uploading size={16} className={prefixCls('upload-status-icon')} />;
  }
  if (status === 'done') {
    return <CheckCircleFilled size={16} className={classNames(prefixCls('upload-status-icon'), prefixCls('upload-status-done'))} />;
  }
  return <CloseCircleFilled size={16} className={classNames(prefixCls('upload-status-icon'), prefixCls('upload-status-error'))} />;
};

/* ===== 内部共享逻辑（Upload 与 Dragger 共用） ===== */

interface UseUploadCoreOptions {
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  maxCount?: number;
  maxSize?: number;
  action?: string;
  headers?: Record<string, string>;
  onChange?: (fileList: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => boolean | void | Promise<boolean | void>;
  beforeUpload?: (file: File) => boolean | Promise<File>;
  customRequest?: (options: CustomRequestOptions) => void;
}

/**
 * 文件上传核心流：列表受控/非受控、maxCount 收敛、上传编排（customRequest / action / 模拟）。
 * 列表写入统一走 commit：非受控写内部状态，受控只回调 onChange，由调用方决定是否更新。
 */
function useUploadCore(options: UseUploadCoreOptions) {
  const {
    fileList: controlledList,
    defaultFileList,
    maxCount,
    maxSize,
    action,
    headers,
    onChange,
    onRemove,
    beforeUpload,
    customRequest,
  } = options;

  const isControlled = controlledList !== undefined;
  // 状态值本身不直接读取（渲染读 listRef 即时快照），仅用于触发重渲染
  const [, setInternalList] = useState<UploadFile[]>(defaultFileList ?? []);
  // 非受控模式的即时快照：异步补丁（patchFile）从这里读最新列表，避免 setState 闭包过期
  const listRef = useRef<UploadFile[]>(defaultFileList ?? []);

  const currentList = isControlled ? (controlledList as UploadFile[]) : listRef.current;

  /** 唯一的列表写入口 */
  const commit = useCallback(
    (next: UploadFile[]) => {
      listRef.current = next;
      if (!isControlled) setInternalList(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  /** 按 uid 局部更新单个文件 */
  const patchFile = useCallback(
    (uid: string, patch: Partial<UploadFile>) => {
      const base = isControlled ? (controlledList as UploadFile[]) : listRef.current;
      commit(base.map((f) => (f.uid === uid ? { ...f, ...patch } : f)));
    },
    [commit, isControlled, controlledList],
  );

  /** 模拟上传过程（未配置 action / customRequest 时保持原行为，便于演示与测试） */
  const simulateUpload = useCallback(
    (uploadFile: UploadFile) => {
      setTimeout(() => {
        patchFile(uploadFile.uid, { status: 'done' as const });
      }, 1500);
    },
    [patchFile],
  );

  /** 发起上传：customRequest 优先，其次 action 真实请求，否则定时模拟 */
  const startUpload = useCallback(
    (uploadFile: UploadFile) => {
      if (customRequest && uploadFile.file) {
        customRequest({
          file: uploadFile.file,
          action,
          headers,
          onSuccess: () => patchFile(uploadFile.uid, { status: 'done' as const }),
          onError: () => patchFile(uploadFile.uid, { status: 'error' as const }),
        });
        return;
      }
      if (!action || !uploadFile.file) {
        simulateUpload(uploadFile);
        return;
      }
      requestUpload({ file: uploadFile.file, action, headers })
        .then(() => patchFile(uploadFile.uid, { status: 'done' as const }))
        .catch(() => patchFile(uploadFile.uid, { status: 'error' as const }));
    },
    [customRequest, action, headers, patchFile, simulateUpload],
  );

  /** 处理选择的文件： maxSize / beforeUpload 过滤 → maxCount 收敛 → 追加并上传 */
  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const incoming: UploadFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (maxSize && file.size > maxSize) continue;

        if (beforeUpload) {
          try {
            const result = await beforeUpload(file);
            if (result === false) continue;
          } catch {
            continue;
          }
        }

        incoming.push({
          uid: generateUid(),
          name: file.name,
          status: 'uploading',
          file,
          url: URL.createObjectURL(file),
        });
      }

      if (incoming.length === 0) return;

      // maxCount 收敛：为 1 时新选择直接替换；否则只保留剩余名额
      let accepted = incoming;
      if (maxCount === 1) {
        accepted = [incoming[0]];
      } else if (maxCount !== undefined) {
        const room = maxCount - currentList.length;
        if (room <= 0) return;
        accepted = incoming.slice(0, room);
      }

      const nextList = maxCount === 1 ? accepted : [...currentList, ...accepted];
      commit(nextList);
      accepted.forEach((f) => startUpload(f));
    },
    [maxSize, beforeUpload, maxCount, currentList, commit, startUpload],
  );

  /** 删除文件；onRemove 返回 false 时阻止 */
  const handleRemove = useCallback(
    async (uid: string) => {
      const file = currentList.find((f) => f.uid === uid);
      if (!file) return;
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return;
      }
      commit(currentList.filter((f) => f.uid !== uid));
    },
    [currentList, onRemove, commit],
  );

  return { fileList: currentList, processFiles, handleRemove };
}

/* ===== Upload 主组件 ===== */

const UploadBase = forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      accept,
      multiple = false,
      disabled = false,
      maxSize,
      maxCount,
      listType = 'text',
      fileList,
      defaultFileList,
      action,
      headers,
      onChange,
      beforeUpload,
      onRemove,
      onPreview,
      customRequest,
      className,
      style,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const { fileList: currentList, processFiles, handleRemove } = useUploadCore({
      fileList,
      defaultFileList,
      maxCount,
      maxSize,
      action,
      headers,
      onChange,
      onRemove,
      beforeUpload,
      customRequest,
    });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        // 重置 input 以便再次选择相同文件
        if (inputRef.current) inputRef.current.value = '';
      },
      [processFiles],
    );

    /** 点击触发文件选择 */
    const handleClick = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    /* --- className --- */
    const wrapperCls = classNames(
      prefixCls('upload'),
      prefixCls(`upload-${listType}`),
      disabled && prefixCls('upload-disabled'),
      className,
    );

    /* --- 渲染文件列表项 --- */
    const renderFileItem = (file: UploadFile) => {
      const itemCls = classNames(
        prefixCls('upload-file'),
        prefixCls(`upload-file-${file.status}`),
      );

      const nameNode = (
        <span
          className={classNames(
            prefixCls('upload-file-name'),
            onPreview && prefixCls('upload-file-name-link'),
          )}
          title={file.name}
          onClick={onPreview ? () => onPreview(file) : undefined}
          role={onPreview ? 'button' : undefined}
          tabIndex={onPreview ? 0 : undefined}
          onKeyDown={
            onPreview
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPreview(file);
                  }
                }
              : undefined
          }
        >
          {file.name}
        </span>
      );

      return (
        <div key={file.uid} className={itemCls}>
          {(listType === 'picture' || listType === 'picture-card') && (
            <div className={prefixCls('upload-file-thumbnail')}>
              {file.url ? (
                <img src={file.url} alt={file.name} />
              ) : (
                <PicturePlaceholder size={24} />
              )}
            </div>
          )}
          <div className={prefixCls('upload-file-info')}>
            {nameNode}
            <StatusIcon status={file.status} />
          </div>
          <button
            type="button"
            className={prefixCls('upload-file-remove')}
            onClick={() => handleRemove(file.uid)}
            aria-label={`删除 ${file.name}`}
            title="删除文件"
          >
            <Close size={14} />
          </button>
        </div>
      );
    };

    return (
      <div ref={ref} className={wrapperCls} style={style}>
        <input
          ref={inputRef}
          type="file"
          className={prefixCls('upload-input')}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
        />
        <button
          type="button"
          className={prefixCls('upload-trigger')}
          onClick={handleClick}
          disabled={disabled}
          aria-label="选择文件上传"
        >
          <UploadIcon size={16} />
          <span>点击上传</span>
        </button>
        {currentList.length > 0 && (
          <div className={prefixCls('upload-list')} role="list">
            {currentList.map(renderFileItem)}
          </div>
        )}
      </div>
    );
  },
);

UploadBase.displayName = 'Upload';

/* ===== Dragger 子组件 ===== */

export interface DraggerProps extends UploadProps {
  children?: React.ReactNode;
}

const Dragger = forwardRef<HTMLDivElement, DraggerProps>(
  (
    {
      accept,
      multiple = false,
      disabled = false,
      maxSize,
      maxCount,
      fileList,
      defaultFileList,
      action,
      headers,
      onChange,
      beforeUpload,
      onRemove,
      onPreview,
      customRequest,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { fileList: currentList, processFiles, handleRemove } = useUploadCore({
      fileList,
      defaultFileList,
      maxCount,
      maxSize,
      action,
      headers,
      onChange,
      onRemove,
      beforeUpload,
      customRequest,
    });

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      },
      [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;
        processFiles(e.dataTransfer.files);
      },
      [disabled, processFiles],
    );

    const handleClick = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = '';
      },
      [processFiles],
    );

    const wrapperCls = classNames(
      prefixCls('upload-dragger'),
      isDragOver && prefixCls('upload-dragger-hover'),
      disabled && prefixCls('upload-dragger-disabled'),
      className,
    );

    return (
      <div ref={ref} className={wrapperCls} style={style}>
        <input
          ref={inputRef}
          type="file"
          className={prefixCls('upload-input')}
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
        />
        <div
          className={prefixCls('upload-dragger-area')}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          aria-label="拖拽文件到此区域上传"
          tabIndex={disabled ? -1 : 0}
        >
          {children ?? (
            <>
              <CloudUpload size={48} className={prefixCls('upload-dragger-icon')} />
              <p className={prefixCls('upload-dragger-text')}>
                将文件拖拽到此区域上传
              </p>
              <p className={prefixCls('upload-dragger-hint')}>
                支持单个或批量上传
              </p>
            </>
          )}
        </div>
        {currentList.length > 0 && (
          <div className={prefixCls('upload-list')} role="list">
            {currentList.map((file) => {
              const itemCls = classNames(
                prefixCls('upload-file'),
                prefixCls(`upload-file-${file.status}`),
              );
              return (
                <div key={file.uid} className={itemCls}>
                  <div className={prefixCls('upload-file-info')}>
                    <span
                      className={classNames(
                        prefixCls('upload-file-name'),
                        onPreview && prefixCls('upload-file-name-link'),
                      )}
                      title={file.name}
                      onClick={onPreview ? () => onPreview(file) : undefined}
                      role={onPreview ? 'button' : undefined}
                    >
                      {file.name}
                    </span>
                    <StatusIcon status={file.status} />
                  </div>
                  <button
                    type="button"
                    className={prefixCls('upload-file-remove')}
                    onClick={() => handleRemove(file.uid)}
                    aria-label={`删除 ${file.name}`}
                  >
                    <Close size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

Dragger.displayName = 'Upload.Dragger';

/* ===== 复合组件 ===== */

interface UploadCompound
  extends React.ForwardRefExoticComponent<
    UploadProps & React.RefAttributes<HTMLDivElement>
  > {
  Dragger: typeof Dragger;
}

const Upload = UploadBase as unknown as UploadCompound;
Upload.Dragger = Dragger;

export { Upload, Dragger };
export default Upload;
