/** 生成带前缀的 CSS 类名 */
export const prefixCls = (name: string): string => `aura-${name}`;

/** 合并 className */
export const classNames = (...args: (string | undefined | null | false)[]): string =>
  args.filter(Boolean).join(' ');

/** 深拷贝 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/** 防抖 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** 节流 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number
): ((...args: Parameters<T>) => void) => {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
};

/** 判断是否为空值 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
