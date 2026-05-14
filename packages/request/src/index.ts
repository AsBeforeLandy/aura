/** 请求方法类型 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

/** 请求配置 */
export interface RequestConfig<T = unknown> {
  /** 请求地址 */
  url: string;
  /** 请求方法 */
  method?: HttpMethod;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 查询参数 */
  params?: Record<string, string | number | boolean>;
  /** 请求体 */
  data?: unknown;
  /** 基础 URL 前缀 */
  baseURL?: string;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 携带凭证 */
  credentials?: RequestCredentials;
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  /** 请求前拦截器 */
  beforeRequest?: (config: RequestConfig<T>) => RequestConfig<T>;
  /** 响应后拦截器 */
  afterResponse?: (response: unknown) => unknown;
}

/** 统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 请求错误类 */
export class RequestError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
  }
}

/** 全局默认配置 */
const globalConfig: Partial<RequestConfig> = {
  baseURL: '',
  timeout: 10000,
  credentials: 'same-origin',
  responseType: 'json',
};

/** 设置全局默认配置 */
export const setRequestDefaults = (config: Partial<RequestConfig>) => {
  Object.assign(globalConfig, config);
};

/** 拼接查询参数 */
const buildQueryString = (params?: Record<string, string | number | boolean>): string => {
  if (!params) return '';
  const search = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      acc[k] = String(v);
      return acc;
    }, {})
  ).toString();
  return search ? `?${search}` : '';
};

/** 解析响应体 */
const parseResponse = async (response: Response, responseType: string) => {
  switch (responseType) {
    case 'text': return response.text();
    case 'blob': return response.blob();
    case 'arrayBuffer': return response.arrayBuffer();
    default: return response.json();
  }
};

/** 核心请求函数 */
async function request<T = unknown>(config: RequestConfig<T>): Promise<T> {
  const merged: RequestConfig<T> = { ...globalConfig, ...config };

  // 请求前拦截
  const finalConfig = merged.beforeRequest ? merged.beforeRequest(merged) : merged;

  const { url, method = 'GET', headers = {}, params, data, baseURL, timeout, credentials, responseType, afterResponse } = finalConfig;

  const fullURL = `${baseURL || ''}${url}${buildQueryString(params as Record<string, string | number | boolean>)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout || 10000);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials,
    signal: controller.signal,
  };

  if (method !== 'GET' && method !== 'HEAD' && data !== undefined) {
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullURL, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new RequestError(
        `请求失败: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    let result = await parseResponse(response, responseType || 'json');

    // 响应后拦截
    if (afterResponse) {
      result = afterResponse(result) as T;
    }

    return result as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new RequestError('请求超时', 408);
    }
    throw error;
  }
}

/** GET 请求 */
export const get = <T = unknown>(url: string, params?: Record<string, string | number | boolean>, config?: Partial<RequestConfig<T>>) =>
  request<T>({ ...config, url, method: 'GET', params });

/** POST 请求 */
export const post = <T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig<T>>) =>
  request<T>({ ...config, url, method: 'POST', data });

/** PUT 请求 */
export const put = <T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig<T>>) =>
  request<T>({ ...config, url, method: 'PUT', data });

/** DELETE 请求 */
export const del = <T = unknown>(url: string, config?: Partial<RequestConfig<T>>) =>
  request<T>({ ...config, url, method: 'DELETE' });

/** PATCH 请求 */
export const patch = <T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig<T>>) =>
  request<T>({ ...config, url, method: 'PATCH', data });

export { request };
export default request;
