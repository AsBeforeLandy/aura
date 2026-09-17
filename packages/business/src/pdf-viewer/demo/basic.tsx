import { useState } from 'react';
import { Button, Space, Tag } from 'antd';
import { PdfViewer } from '@aura/business';

const Demo = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('未打开');

  return (
    <Space orientation="vertical" size="middle">
      <Space>
        <Button type="primary" onClick={() => setOpen(true)}>
          预览文档
        </Button>
        <Tag>最近动作：{status}</Tag>
      </Space>

      <PdfViewer
        url="/aura/pdf-viewer/sample.pdf"
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setStatus(next ? '打开' : '关闭');
        }}
        onPageChange={(page) => setStatus(`翻到第 ${page} 页`)}
      />
    </Space>
  );
};

export default Demo;
