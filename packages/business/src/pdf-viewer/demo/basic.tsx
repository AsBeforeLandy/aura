import { useState } from 'react';
import { Button, Space, Tag } from 'antd';
import { PdfViewer } from '@aura/business';

const Demo = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('未打开');

  return (
    <Space direction="vertical" size="middle">
      <Space>
        <Button type="primary" onClick={() => setOpen(true)}>
          预览文档
        </Button>
        <Tag>最近动作：{status}</Tag>
      </Space>

      <PdfViewer
        url="/aura/pdf-viewer/sample.pdf"
        // 文档站示例：运行时加载原样 pdf.js 与资源（本仓库构建链会改写打包后的 pdf.js，
        // 详见组件文档「已知问题」）；业务项目中通常无需传这两个属性
        pdfjsSrc="/aura/pdf-viewer/vendor/pdf.min.mjs"
        assetBaseUrl="/aura/pdf-viewer/vendor/"
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
