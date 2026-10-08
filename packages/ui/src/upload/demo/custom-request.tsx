import React from 'react';
import { Upload } from '@aura/ui';
import type { CustomRequestOptions } from '@aura/ui';

/** customRequest 接入自有请求层：通过 onSuccess / onError 回报状态，组件据此更新列表。 */
export default () => {
  const customRequest = (options: CustomRequestOptions) => {
    const { file, onSuccess, onError } = options;
    // 实际项目中替换为自有请求实现
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/upload', { method: 'POST', body: formData })
      .then((res) => (res.ok ? onSuccess(res) : onError(new Error('上传失败'))))
      .catch((err) => onError(err));
  };

  return <Upload customRequest={customRequest} multiple />;
};
