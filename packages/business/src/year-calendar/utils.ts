/**
 * YearCalendar 的纯函数工具层：全年周网格的构建与日期格式化。
 *
 * 与 React 渲染完全解耦，便于独立单测；组件本体只负责交互与视图。
 */

/** 月份标签（1 月 - 12 月） */
export const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);

/** 周一起始的星期标签 */
export const WEEK_LABELS_MONDAY_FIRST = ['一', '二', '三', '四', '五', '六', '日'];

/** 周日起始的星期标签 */
export const WEEK_LABELS_SUNDAY_FIRST = ['日', '一', '二', '三', '四', '五', '六'];

/** 网格中的一个日期格 */
export interface DayCell {
  /** `YYYY-MM-DD` */
  date: string;
  /** 是否属于相邻年份（仅年初 / 年末凑整周用） */
  outside: boolean;
}

/** 一列 = 一整周（7 天） */
export type WeekColumn = DayCell[];

/** 某个月在网格中占据的列区间 */
export interface MonthSpan {
  /** 月份索引 0-11 */
  month: number;
  /** 起始列（含） */
  start: number;
  /** 结束列（含） */
  end: number;
}

/** `Date` → `YYYY-MM-DD` */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 构建**全年连续**的周网格
 *
 * 与「按月分块」不同，这里把整年铺成一条不间断的「周 × 星期」网格：
 * 每列固定 7 格、且都落在真实的星期行上，因此不会出现任何空白位，
 * 也不存在「属于相邻月份」的无效单元格 —— 每个月之间天然无缝衔接。
 *
 * 仅 1 月 1 日之前、12 月 31 日之后（用于凑满首尾整周）的少数格子标记为 outside。
 */
export function buildYearWeeks(
  year: number,
  weekStartsOn: 0 | 1,
): { weeks: WeekColumn[]; spans: MonthSpan[] } {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  // 回溯到「1 月 1 日所在周」的第一天
  const leading = (firstDay.getDay() - weekStartsOn + 7) % 7;
  const cursor = new Date(year, 0, 1 - leading);

  const weeks: WeekColumn[] = [];
  while (cursor <= lastDay) {
    const column: WeekColumn = [];
    for (let i = 0; i < 7; i += 1) {
      column.push({
        date: formatDate(cursor),
        outside: cursor.getFullYear() !== year,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(column);
  }

  // 统计每个月横跨的列区间
  const spanMap = new Map<number, MonthSpan>();
  weeks.forEach((column, col) => {
    column.forEach((cell) => {
      if (cell.outside) return;
      const month = Number(cell.date.slice(5, 7)) - 1;
      const exist = spanMap.get(month);
      if (exist) exist.end = col;
      else spanMap.set(month, { month, start: col, end: col });
    });
  });
  const spans = [...spanMap.values()].sort((a, b) => a.month - b.month);

  return { weeks, spans };
}
