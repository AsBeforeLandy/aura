import React, { useState } from 'react';
import { Upload } from '@aura-react-comp/ui';
import type { UploadFile } from '@aura-react-comp/ui';

/** 受控 fileList 回显已有文件（编辑页场景）；maxCount 限制数量；onRemove 可拦截删除。 */
export default () => {
  const [fileList, setFileList] = useState<UploadFile[]>([
    { uid: 'server-1', name: '立项说明书.pdf', status: 'done' },
    { uid: 'server-2', name: '验收报告.docx', status: 'done' },
  ]);

  return (
    <Upload
      fileList={fileList}
      onChange={setFileList}
      maxCount={3}
      listType="picture"
      onRemove={(file) => {
        // 返回 false 可阻止删除（例如行删除确认）
        return window.confirm(`确定删除 ${file.name} 吗？`);
      }}
    />
  );
};
