import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { Uploading, CheckCircleFilled, CloseCircleFilled, Close, Upload as UploadIcon, CloudUpload, PicturePlaceholder } from '@aura/icons';
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
    return <Uploading size={16} className={prefixCls('upload-status-icon')} />;
  }
  if (status === 'done') {
    return <CheckCircleFilled size={16} className={classNames(prefixCls('upload-status-icon'), prefixCls('upload-status-done'))} />;
  }
  return <CloseCircleFilled size={16} className={classNames(prefixCls('upload-status-icon'), prefixCls('upload-status-error'))} />;
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
                <PicturePlaceholder size={24} />
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
          <CloudUpload size={48} className={prefixCls('upload-dragger-icon')} />
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
