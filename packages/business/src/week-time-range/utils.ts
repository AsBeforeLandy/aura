/**
 * WeekTimeRange 的纯函数工具层：时间解析、槽位生成、区间合并 / 裁剪。
 *
 * 与 React 渲染完全解耦，便于独立单测；组件本体只负责交互与视图。
 */

/** 一个时间段（24 小时制） */
export interface TimeRange {
  /** 开始时间，格式 `HH:mm` */
  start: string;
  /** 结束时间，格式 `HH:mm` */
  end: string;
}

/** 一周七天，每天若干互不重叠的时间段 */
export type WeekTimeRangeValue = TimeRange[][];

/** 渲染用的时间槽 */
export interface Slot {
  /** 起始分钟数 */
  start: number;
  /** 结束分钟数 */
  end: number;
  /** `HH:mm-HH:mm` */
  label: string;
}

/** 一周天数 */
export const DAY_COUNT = 7;

/** 周一起始的星期标签 */
export const WEEK_LABELS_MONDAY_FIRST = [
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
  '周日',
];

/** 周日起始的星期标签 */
export const WEEK_LABELS_SUNDAY_FIRST = [
  '周日',
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
];

/** 分钟数 → `HH:mm` */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** `HH:mm` → 分钟数 */
export function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** 按指定粒度生成一整天的连续时间槽 */
export function buildSlots(stepMinutes: number): Slot[] {
  const count = (24 * 60) / stepMinutes;
  return Array.from({ length: count }, (_, i) => {
    const start = i * stepMinutes;
    const end = (i + 1) * stepMinutes;
    return { start, end, label: `${formatMinutes(start)}-${formatMinutes(end)}` };
  });
}

/** `TimeRange` → `[起始分钟, 结束分钟]` */
export function toMinutes(range: TimeRange): [number, number] {
  return [parseTime(range.start), parseTime(range.end)];
}

/** 合并重叠 / 相邻的时间段 */
export function mergeRanges(ranges: TimeRange[]): TimeRange[] {
  if (!ranges.length) return [];
  const parsed = ranges.map(toMinutes).sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  let [curStart, curEnd] = parsed[0];
  for (let i = 1; i < parsed.length; i += 1) {
    const [s, e] = parsed[i];
    if (s <= curEnd) {
      curEnd = Math.max(curEnd, e);
    } else {
      merged.push([curStart, curEnd]);
      [curStart, curEnd] = [s, e];
    }
  }
  merged.push([curStart, curEnd]);
  return merged.map(([s, e]) => ({ start: formatMinutes(s), end: formatMinutes(e) }));
}

/** 从时间段集合中挖掉目标区间 */
export function subtractRange(
  ranges: TimeRange[],
  [ts, te]: [number, number],
): TimeRange[] {
  const result: Array<[number, number]> = [];
  ranges.forEach((range) => {
    const [s, e] = toMinutes(range);
    if (ts <= s && te >= e) return; // 完全覆盖 → 整段移除
    if (ts > s && te < e) {
      // 命中中段 → 切成两段
      result.push([s, ts], [te, e]);
    } else if (ts > s && ts < e) {
      result.push([s, ts]); // 截断尾部
    } else if (te > s && te < e) {
      result.push([te, e]); // 截断头部
    } else {
      result.push([s, e]);
    }
  });
  return result.map(([s, e]) => ({ start: formatMinutes(s), end: formatMinutes(e) }));
}

/** 判断某个时间槽是否已被完全覆盖 */
export function isCovered(
  ranges: TimeRange[],
  [ss, se]: [number, number],
): boolean {
  return ranges.some((range) => {
    const [s, e] = toMinutes(range);
    return ss >= s && se <= e;
  });
}

/** 生成 7 天的空值 */
export function createEmptyValue(): WeekTimeRangeValue {
  return Array.from({ length: DAY_COUNT }, () => []);
}
