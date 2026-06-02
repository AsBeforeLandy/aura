import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { ChevronLeft, ChevronRight } from '@aura/icons';
import './index.less';

/* ===== 页码范围计算 ===== */

/**
 * 生成应显示的页码数组
 * 超过 7 页时用 -1 表示省略号
 */
function generatePages(current: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [1];

  if (current <= 4) {
    // 靠近开头
    pages.push(2, 3, 4, 5, -1, totalPages);
  } else if (current >= totalPages - 3) {
    // 靠近末尾
    pages.push(-1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    // 中间
    pages.push(-1, current - 1, current, current + 1, -1, totalPages);
  }

  return pages;
}

/* ===== Pagination ===== */
export interface PaginationProps {
  /** 当前页码（受控） */
  current?: number;
  /** 默认页码
   *  @default 1
   */
  defaultCurrent?: number;
  /** 每页条数
   *  @default 10
   */
  pageSize?: number;
  /** 数据总条数 */
  total: number;
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean;
  /** 是否显示快速跳转输入框 */
  showQuickJumper?: boolean;
  /** 尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md';
  /** 页码或每页条数变化回调 */
  onChange?: (page: number, pageSize: number) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      current: controlledCurrent,
      defaultCurrent = 1,
      pageSize: controlledPageSize,
      total,
      showSizeChanger = false,
      showQuickJumper = false,
      size = 'md',
      onChange,
      className,
      style,
    },
    ref,
  ) => {
    /* --- 受控/非受控 --- */
    const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
    const [internalPageSize, setInternalPageSize] = useState(controlledPageSize ?? 10);

    const isControlled = controlledCurrent !== undefined;
    const currentPage = isControlled ? controlledCurrent : internalCurrent;
    const pageSize = controlledPageSize ?? internalPageSize;

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    /* --- 翻页逻辑 --- */
    const goToPage = useCallback(
      (page: number) => {
        const safePage = Math.max(1, Math.min(page, totalPages));
        if (!isControlled) {
          setInternalCurrent(safePage);
        }
        onChange?.(safePage, pageSize);
      },
      [isControlled, totalPages, onChange, pageSize],
    );

    const handlePageSizeChange = useCallback(
      (newPageSize: number) => {
        if (controlledPageSize === undefined) {
          setInternalPageSize(newPageSize);
        }
        // 切换 pageSize 后回到第一页
        const newTotalPages = Math.max(1, Math.ceil(total / newPageSize));
        if (!isControlled) {
          setInternalCurrent(1);
        }
        onChange?.(1, newPageSize);
        void newTotalPages;
      },
      [controlledPageSize, isControlled, onChange, total],
    );

    /* --- 页码数组 --- */
    const pages = generatePages(currentPage, totalPages);

    /* --- Quick Jumper --- */
    const [jumperValue, setJumperValue] = useState('');
    const handleJumperSubmit = useCallback(() => {
      const page = parseInt(jumperValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        goToPage(page);
      }
      setJumperValue('');
    }, [jumperValue, totalPages, goToPage]);

    /* --- className --- */
    const wrapperCls = classNames(
      prefixCls('pagination'),
      prefixCls(`pagination-${size}`),
      className,
    );

    /* --- 上一页/下一页箭头 --- */
    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;

    return (
      <div ref={ref} className={wrapperCls} style={style} role="navigation" aria-label="分页">
        {/* 上一页 */}
        <button
          type="button"
          className={classNames(
            prefixCls('pagination-btn'),
            prefixCls('pagination-prev'),
            prevDisabled && prefixCls('pagination-btn-disabled'),
          )}
          onClick={() => !prevDisabled && goToPage(currentPage - 1)}
          disabled={prevDisabled}
          aria-label="上一页"
        >
          <ChevronLeft size={14} />
        </button>

        {/* 页码按钮 */}
        <div className={prefixCls('pagination-pages')}>
          {pages.map((page, index) => {
            if (page === -1) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={prefixCls('pagination-ellipsis')}
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                className={classNames(
                  prefixCls('pagination-btn'),
                  isActive && prefixCls('pagination-btn-active'),
                )}
                onClick={() => !isActive && goToPage(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`第 ${page} 页`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* 下一页 */}
        <button
          type="button"
          className={classNames(
            prefixCls('pagination-btn'),
            prefixCls('pagination-next'),
            nextDisabled && prefixCls('pagination-btn-disabled'),
          )}
          onClick={() => !nextDisabled && goToPage(currentPage + 1)}
          disabled={nextDisabled}
          aria-label="下一页"
        >
          <ChevronRight size={14} />
        </button>

        {/* 每页条数选择器 */}
        {showSizeChanger && (
          <select
            className={prefixCls('pagination-size-changer')}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            aria-label="每页条数"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} 条/页
              </option>
            ))}
          </select>
        )}

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className={prefixCls('pagination-jumper')}>
            <span className={prefixCls('pagination-jumper-text')}>跳至</span>
            <input
              className={prefixCls('pagination-jumper-input')}
              value={jumperValue}
              onChange={(e) => setJumperValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJumperSubmit();
              }}
              aria-label="跳转页码"
            />
            <span className={prefixCls('pagination-jumper-text')}>页</span>
          </div>
        )}
      </div>
    );
  },
);

Pagination.displayName = 'Pagination';
