import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** 归一化后的拖拽矩形（相对容器左上角，left/top 恒小于 right/bottom） */
export interface DragRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** 相对容器的坐标点 */
export interface DragPoint {
  x: number;
  y: number;
}

/** 拖拽结束时的附加信息 */
export interface DragSelectMeta {
  /**
   * 是否为「真实拖拽」
   *
   * 位移小于阈值时视为单击，调用方应交给单元格自身的 onClick 处理，
   * 避免与拖拽逻辑重复切换同一个目标。
   */
  isDrag: boolean;
}

/** 判定为拖拽所需的最小位移（px，曼哈顿距离） */
const DRAG_THRESHOLD = 3;

export interface UseDragSelectOptions {
  /** 容器元素 ref，所有坐标以此为基准 */
  containerRef: React.RefObject<HTMLElement | null>;
  /** 拖拽结束回调，参数为归一化后的矩形与附加信息 */
  onSelect: (rect: DragRect, meta: DragSelectMeta) => void;
  /**
   * 是否禁用拖拽
   * @default false
   */
  disabled?: boolean;
  /** 选区遮罩的自定义样式 */
  selectionStyle?: React.CSSProperties;
}

export interface UseDragSelectResult {
  /** 是否正在拖拽中 */
  dragging: boolean;
  /** 选区遮罩样式（配合绝对定位的遮罩元素使用） */
  overlayStyle: React.CSSProperties;
  /** 需要展开到容器的鼠标事件 */
  containerProps: {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
}

/**
 * useDragSelect — 拖拽框选
 *
 * 抽出 WeekTimeRange / YearCalendar 共用的框选交互：
 * 记录起止坐标 → 拖拽中实时渲染选区遮罩 → 抬起时回调归一化矩形。
 *
 * 命中判定交给调用方，因为不同网格结构（表格式 / 月块式）的判定方式不同。
 */
export function useDragSelect({
  containerRef,
  onSelect,
  disabled = false,
  selectionStyle,
}: UseDragSelectOptions): UseDragSelectResult {
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<DragPoint | null>(null);
  const [end, setEnd] = useState<DragPoint | null>(null);
  /** 本次拖拽累计的最大位移，用于区分「单击」与「拖拽」 */
  const movedRef = useRef(0);

  // 用 ref 保存最新回调，避免拖拽过程中闭包过期
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 拖拽期间禁止文本选中，避免出现浏览器默认的蓝色选区
  useEffect(() => {
    if (!dragging) return;
    const previous = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.userSelect = previous;
    };
  }, [dragging]);

  const toRelative = useCallback(
    (e: React.MouseEvent<HTMLElement>): DragPoint => {
      const el = containerRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [containerRef],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      e.preventDefault();
      const point = toRelative(e);
      movedRef.current = 0;
      setDragging(true);
      setStart(point);
      setEnd(point);
    },
    [disabled, toRelative],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!dragging) return;
      const point = toRelative(e);
      if (start) {
        movedRef.current = Math.max(
          movedRef.current,
          Math.abs(point.x - start.x) + Math.abs(point.y - start.y),
        );
      }
      setEnd(point);
    },
    [dragging, start, toRelative],
  );

  const finish = useCallback(() => {
    setDragging(false);
    if (start && end) {
      onSelectRef.current(
        {
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          right: Math.max(start.x, end.x),
          bottom: Math.max(start.y, end.y),
        },
        { isDrag: movedRef.current >= DRAG_THRESHOLD },
      );
    }
    setStart(null);
    setEnd(null);
    movedRef.current = 0;
  }, [start, end]);

  const overlayStyle = useMemo<React.CSSProperties>(() => {
    if (!start || !end) {
      return { display: 'none' };
    }
    return {
      position: 'absolute',
      pointerEvents: 'none',
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y),
      ...selectionStyle,
    };
  }, [start, end, selectionStyle]);

  return {
    dragging,
    overlayStyle,
    containerProps: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: finish,
      onMouseLeave: () => {
        if (dragging) finish();
      },
    },
  };
}
