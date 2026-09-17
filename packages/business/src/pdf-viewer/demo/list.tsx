import { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { PdfViewer } from '@aura/business';

interface FileItem {
  name: string;
  url: string;
}

const FILES: FileItem[] = [
  { name: 'Aura 产品介绍.pdf', url: '/aura/pdf-viewer/sample.pdf' },
  // 演示加载失败态：出现错误提示与重试按钮
  { name: '不存在文档.pdf', url: '/aura/pdf-viewer/not-exist.pdf' },
];

const Demo = () => {
  const [current, setCurrent] = useState<FileItem | null>(null);

  return (
    <Space direction="vertical" size="small" style={{ width: 300 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        多文档共用一个预览实例：url 切换时自动重新加载；第二个文件演示失败态。
      </Typography.Text>
      {FILES.map((file) => (
        <Space
          key={file.url}
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <span>{file.name}</span>
          <Button size="small" onClick={() => setCurrent(file)}>
            查看
          </Button>
        </Space>
      ))}

      <PdfViewer
        url={current?.url}
        open={!!current}
        onOpenChange={(next) => {
          if (!next) setCurrent(null);
        }}
        title={current?.name ?? '文档预览'}
      />
    </Space>
  );
};

export default Demo;
