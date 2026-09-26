import React, { useEffect, useState } from 'react';
import { FileCard } from '@aura/x';
import type { FileCardStatus } from '@aura/x';

interface DemoFile {
  id: number;
  name: string;
  size: number;
  status: FileCardStatus;
  percent?: number;
  errorTip?: string;
  description?: string;
}

const INITIAL_FILES: DemoFile[] = [
  { id: 1, name: '需求文档.pdf', size: 1024 * 1024 * 2.4, status: 'done', description: 'PRD v2.3 终稿' },
  { id: 2, name: '首页设计稿.png', size: 1024 * 780, status: 'uploading', percent: 35 },
  { id: 3, name: '接口规范.yaml', size: 1024 * 12, status: 'error', errorTip: '超过单文件 10 KB 限制' },
  { id: 4, name: 'README', size: 512, status: 'init' },
];

export default () => {
  const [files, setFiles] = useState<DemoFile[]>(INITIAL_FILES);

  // 模拟上传：每 400ms 推进 15%，到 100% 转为完成态
  useEffect(() => {
    const timer = window.setInterval(() => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.status !== 'uploading' || file.percent === undefined) return file;
          const next = Math.min(100, file.percent + 15);
          return next >= 100
            ? { ...file, status: 'done' as FileCardStatus, percent: 100 }
            : { ...file, percent: next };
        }),
      );
    }, 400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 640 }}>
      {files.map((file) => (
        <FileCard
          key={file.id}
          name={file.name}
          size={file.size}
          status={file.status}
          percent={file.percent}
          description={file.description}
          errorTip={file.errorTip}
          onRemove={() =>
            setFiles((prev) => prev.filter((item) => item.id !== file.id))
          }
        />
      ))}
      {files.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--aura-text-secondary)' }}>
          附件已全部移除
        </p>
      ) : null}
    </div>
  );
};
