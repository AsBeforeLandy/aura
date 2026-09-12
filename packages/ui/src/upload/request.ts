/**
 * Upload 的真实上传请求，与组件渲染解耦以便单独 mock / 单测。
 */

export interface UploadRequestOptions {
  /** 待上传的文件对象 */
  file: File;
  /** 上传接口地址 */
  action: string;
  /** 附加请求头 */
  headers?: Record<string, string>;
  /** 文件字段名
   *  @default 'file'
   */
  name?: string;
  /** 随文件一同提交的额外表单字段 */
  data?: Record<string, string | Blob>;
}

/**
 * 以 XHR 把文件 POST 到 `action`。
 *
 * - 响应处于 2xx 区间视为成功（resolve）
 * - 其余状态码或网络错误视为失败（reject）
 *
 * 返回原始 XHR 便于调用方读取响应体。
 */
export function requestUpload(
  options: UploadRequestOptions,
): Promise<XMLHttpRequest> {
  const { file, action, headers, name = 'file', data } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append(name, file, file.name);
    if (data) {
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    }

    xhr.open('POST', action);
    if (headers) {
      Object.entries(headers).forEach(([key, value]) =>
        xhr.setRequestHeader(key, value),
      );
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr);
      else reject(xhr);
    };
    xhr.onerror = () => reject(xhr);
    xhr.send(formData);
  });
}
