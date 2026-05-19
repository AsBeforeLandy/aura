/** 生成带前缀的 CSS 类名 */
export function prefixCls(name: string): string {
  return `aura-${name}`;
}

/** 合并 className */
export function classNames(
  ...args: (string | null | undefined | false)[]
): string {
  return args.filter(Boolean).join(' ');
}

/** 防抖 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/** 节流 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  interval: number,
): T {
  let lastTime = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

/** 判断是否为空值 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    return true;
  return false;
}
