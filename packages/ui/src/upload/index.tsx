import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== 类型定义 ===== */

export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  file?: File;
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
  /** 文件列表展示风格
   *  @default 'text'
   */
  listType?: 'text' | 'picture' | 'picture-card';
  /** 上传地址（模拟使用） */
  action?: string;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 文件列表变化回调 */
  onChange?: (fileList: UploadFile[]) => void;
  /** 上传前钩子，返回 false 阻止上传 */
  beforeUpload?: (file: File) => boolean | Promise<File>;
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
    return (
      <svg
        className={prefixCls('upload-status-icon')}
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="currentColor"
      >
        <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
      </svg>
    );
  }
  if (status === 'done') {
    return (
      <svg
        className={classNames(prefixCls('upload-status-icon'), prefixCls('upload-status-done'))}
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="currentColor"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    );
  }
  return (
    <svg
      className={classNames(prefixCls('upload-status-icon'), prefixCls('upload-status-error'))}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
};

/* ===== Upload 主组件 ===== */

const UploadBase = forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      accept,
      multiple = false,
      disabled = false,
      maxSize,
      listType = 'text',
      action,
      headers,
      onChange,
      beforeUpload,
      className,
      style,
    },
    ref,
  ) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    /** 更新文件列表并触发回调 */
    const updateFileList = useCallback(
      (newList: UploadFile[]) => {
        setFileList(newList);
        onChange?.(newList);
      },
      [onChange],
    );

    /** 模拟上传过程 */
    const simulateUpload = useCallback(
      (uploadFile: UploadFile) => {
        // 模拟上传中状态
        setTimeout(() => {
          setFileList((prev) => {
            const newList = prev.map((f) =>
              f.uid === uploadFile.uid ? { ...f, status: 'done' as const } : f,
            );
            onChange?.(newList);
            return newList;
          });
        }, 1500);
      },
      [onChange],
    );

    /** 处理文件选择 */
    const handleChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles: UploadFile[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // 检查文件大小
          if (maxSize && file.size > maxSize) {
            continue;
          }

          // 执行 beforeUpload 钩子
          if (beforeUpload) {
            try {
              const result = await beforeUpload(file);
              if (result === false) continue;
            } catch {
              continue;
            }
          }

          const uploadFile: UploadFile = {
            uid: generateUid(),
            name: file.name,
            status: 'uploading',
            file,
            url: URL.createObjectURL(file),
          };
          newFiles.push(uploadFile);
        }

        if (newFiles.length === 0) {
          // 重置 input 以便再次选择相同文件
          if (inputRef.current) inputRef.current.value = '';
          return;
        }

        const updatedList = [...fileList, ...newFiles];
        updateFileList(updatedList);

        // 模拟上传
        newFiles.forEach((f) => simulateUpload(f));

        // 重置 input
        if (inputRef.current) inputRef.current.value = '';
      },
      [fileList, maxSize, beforeUpload, updateFileList, simulateUpload],
    );

    /** 点击触发文件选择 */
    const handleClick = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    /** 删除文件 */
    const handleRemove = useCallback(
      (uid: string) => {
        const newList = fileList.filter((f) => f.uid !== uid);
        updateFileList(newList);
      },
      [fileList, updateFileList],
    );

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

      return (
        <div key={file.uid} className={itemCls}>
          {(listType === 'picture' || listType === 'picture-card') && (
            <div className={prefixCls('upload-file-thumbnail')}>
              {file.url ? (
                <img src={file.url} alt={file.name} />
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              )}
            </div>
          )}
          <div className={prefixCls('upload-file-info')}>
            <span className={prefixCls('upload-file-name')} title={file.name}>
              {file.name}
            </span>
            <StatusIcon status={file.status} />
          </div>
          <button
            type="button"
            className={prefixCls('upload-file-remove')}
            onClick={() => handleRemove(file.uid)}
            aria-label={`删除 ${file.name}`}
            title="删除文件"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
          </svg>
          <span>点击上传</span>
        </button>
        {fileList.length > 0 && (
          <div className={prefixCls('upload-list')} role="list">
            {fileList.map(renderFileItem)}
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
      action,
      headers,
      onChange,
      beforeUpload,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateFileList = useCallback(
      (newList: UploadFile[]) => {
        setFileList(newList);
        onChange?.(newList);
      },
      [onChange],
    );

    const simulateUpload = useCallback(
      (uploadFile: UploadFile) => {
        setTimeout(() => {
          setFileList((prev) => {
            const newList = prev.map((f) =>
              f.uid === uploadFile.uid ? { ...f, status: 'done' as const } : f,
            );
            onChange?.(newList);
            return newList;
          });
        }, 1500);
      },
      [onChange],
    );

    const processFiles = useCallback(
      async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newFiles: UploadFile[] = [];

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

          const uploadFile: UploadFile = {
            uid: generateUid(),
            name: file.name,
            status: 'uploading',
            file,
            url: URL.createObjectURL(file),
          };
          newFiles.push(uploadFile);
        }

        if (newFiles.length === 0) return;

        const updatedList = [...fileList, ...newFiles];
        updateFileList(updatedList);
        newFiles.forEach((f) => simulateUpload(f));
      },
      [fileList, maxSize, beforeUpload, updateFileList, simulateUpload],
    );

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

    const handleRemove = useCallback(
      (uid: string) => {
        const newList = fileList.filter((f) => f.uid !== uid);
        updateFileList(newList);
      },
      [fileList, updateFileList],
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
          <svg
            className={prefixCls('upload-dragger-icon')}
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="currentColor"
          >
            <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
          </svg>
          <p className={prefixCls('upload-dragger-text')}>
            将文件拖拽到此区域上传
          </p>
          <p className={prefixCls('upload-dragger-hint')}>
            支持单个或批量上传
          </p>
        </div>
        {fileList.length > 0 && (
          <div className={prefixCls('upload-list')} role="list">
            {fileList.map((file) => {
              const itemCls = classNames(
                prefixCls('upload-file'),
                prefixCls(`upload-file-${file.status}`),
              );
              return (
                <div key={file.uid} className={itemCls}>
                  <div className={prefixCls('upload-file-info')}>
                    <span className={prefixCls('upload-file-name')} title={file.name}>
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
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
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
