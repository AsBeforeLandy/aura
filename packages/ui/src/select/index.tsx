import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface SelectProps {
  /** 变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'filled' | 'bordered';
  /** 尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 选项列表 */
  options: Array<{
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
  }>;
  /** 当前值（受控） */
  value?: string | number | (string | number)[];
  /** 默认值（非受控） */
  defaultValue?: string | number | (string | number)[];
  /** 是否多选 */
  multiple?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否可清除 */
  clearable?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 值变化回调 */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** 获取选项的显示标签 */
function getOptionLabel(
  options: SelectProps['options'],
  val: string | number,
): React.ReactNode {
  const opt = options.find((o) => o.value === val);
  return opt ? opt.label : val;
}

/** 判断某个值是否被选中 */
function isSelected(
  currentValue: string | number | (string | number)[] | undefined,
  optionValue: string | number,
): boolean {
  if (currentValue === undefined) return false;
  if (Array.isArray(currentValue)) return currentValue.includes(optionValue);
  return currentValue === optionValue;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      variant = 'default',
      size = 'md',
      disabled = false,
      loading = false,
      options,
      value: controlledValue,
      defaultValue,
      multiple = false,
      searchable = false,
      clearable = false,
      placeholder = '请选择',
      onChange,
      className,
      style,
    },
    ref,
  ) => {
    // 内部维护的值（非受控模式）
    const [internalValue, setInternalValue] = useState<
      string | number | (string | number)[]
    >(() => {
      if (defaultValue !== undefined) return defaultValue;
      return multiple ? [] : '';
    });

    // 当前生效的值
    const currentValue =
      controlledValue !== undefined ? controlledValue : internalValue;

    // 下拉面板展开状态
    const [open, setOpen] = useState(false);
    // 搜索关键字
    const [searchText, setSearchText] = useState('');
    // 键盘聚焦高亮的选项索引
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listId = useId();

    // 监听打开状态或过滤关键字变化，重置高亮索引
    useEffect(() => {
      setActiveIndex(-1);
    }, [open, searchText]);

    // 当 activeIndex 变化时，自动将高亮项滚动到可视区域
    useEffect(() => {
      if (open && activeIndex >= 0) {
        const dropdown = document.getElementById(listId);
        if (dropdown) {
          const activeEl = dropdown.querySelectorAll(`.${prefixCls('select-option')}`)[activeIndex] as HTMLElement;
          if (activeEl && typeof activeEl.scrollIntoView === 'function') {
            activeEl.scrollIntoView({ block: 'nearest' });
          }
        }
      }
    }, [activeIndex, open, listId]);

    // 点击外部关闭下拉面板
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
          setSearchText('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 展开时自动聚焦搜索框
    useEffect(() => {
      if (open && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [open, searchable]);

    // 过滤选项
    const filteredOptions = options.filter((opt) => {
      if (!searchText) return true;
      const label =
        typeof opt.label === 'string' ? opt.label : String(opt.label);
      return label.toLowerCase().includes(searchText.toLowerCase());
    });

    // 选中/取消选中某个值
    const handleSelect = useCallback(
      (optionValue: string | number) => {
        let nextValue: string | number | (string | number)[];

        if (multiple) {
          const arr = Array.isArray(currentValue) ? [...currentValue] : [];
          const idx = arr.indexOf(optionValue);
          if (idx >= 0) {
            arr.splice(idx, 1);
          } else {
            arr.push(optionValue);
          }
          nextValue = arr;
        } else {
          nextValue = optionValue;
        }

        if (controlledValue === undefined) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);

        // 单选模式下选完关闭面板
        if (!multiple) {
          setOpen(false);
          setSearchText('');
        }
      },
      [controlledValue, multiple, onChange],
    );

    // 清除选择
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextValue = multiple ? [] : '';
        if (controlledValue === undefined) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);
      },
      [controlledValue, multiple, onChange],
    );

    // 判断是否有值
    const hasValue = Array.isArray(currentValue)
      ? currentValue.length > 0
      : currentValue !== '' && currentValue !== undefined;

    // 渲染选中值的显示内容
    const renderDisplay = () => {
      if (multiple && Array.isArray(currentValue) && currentValue.length > 0) {
        return (
          <span className={prefixCls('select-tags')}>
            {currentValue.map((val) => (
              <span
                key={val}
                className={prefixCls('select-tag')}
              >
                {getOptionLabel(options, val)}
                <span
                  className={prefixCls('select-tag-close')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(val);
                  }}
                >
                  &times;
                </span>
              </span>
            ))}
          </span>
        );
      }

      if (
        !multiple &&
        currentValue !== '' &&
        currentValue !== undefined &&
        !Array.isArray(currentValue)
      ) {
        return (
          <span className={prefixCls('select-selection-item')}>
            {getOptionLabel(options, currentValue)}
          </span>
        );
      }

      return (
        <span className={prefixCls('select-placeholder')}>{placeholder}</span>
      );
    };

    const cls = classNames(
      prefixCls('select'),
      variant !== 'default' && prefixCls(`select-${variant}`),
      prefixCls(`select-${size}`),
      open && prefixCls('select-open'),
      disabled && prefixCls('select-disabled'),
      multiple && prefixCls('select-multiple'),
      className,
    );

    return (
      <div ref={containerRef} className={cls} style={style}>
        {/* 选择器触发区域 */}
        <div
          ref={ref}
          className={prefixCls('select-selector')}
          onClick={() => {
            if (disabled) return;
            setOpen((prev) => !prev);
          }}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (disabled) return;

            const isInput = e.target instanceof HTMLInputElement;
            if (isInput && e.key === ' ') {
              return;
            }

            if (!open) {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
              return;
            }

            if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (filteredOptions.length === 0) return;
              
              let nextIndex = activeIndex;
              let count = 0;
              do {
                nextIndex = (nextIndex + 1) % filteredOptions.length;
                count++;
              } while (filteredOptions[nextIndex].disabled && count < filteredOptions.length);
              
              if (!filteredOptions[nextIndex].disabled) {
                setActiveIndex(nextIndex);
              }
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (filteredOptions.length === 0) return;
              
              let prevIndex = activeIndex < 0 ? filteredOptions.length : activeIndex;
              let count = 0;
              do {
                prevIndex = (prevIndex - 1 + filteredOptions.length) % filteredOptions.length;
                count++;
              } while (filteredOptions[prevIndex].disabled && count < filteredOptions.length);
              
              if (!filteredOptions[prevIndex].disabled) {
                setActiveIndex(prevIndex);
              }
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
                const activeOpt = filteredOptions[activeIndex];
                if (!activeOpt.disabled) {
                  handleSelect(activeOpt.value);
                }
              } else {
                setOpen(false);
                setSearchText('');
              }
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setOpen(false);
              setSearchText('');
            }
          }}
        >
          {/* 搜索输入框（searchable 模式展开时） */}
          {searchable && open ? (
            <input
              ref={searchInputRef}
              className={prefixCls('select-search-input')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={
                multiple && Array.isArray(currentValue) && currentValue.length > 0
                  ? ''
                  : placeholder
              }
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            renderDisplay()
          )}

          {/* 箭头和清除图标区域 */}
          <span className={prefixCls('select-arrow')}>
            {clearable && hasValue && !disabled ? (
              <span
                className={prefixCls('select-clear')}
                onClick={handleClear}
              >
                &times;
              </span>
            ) : (
              <span className={prefixCls('select-arrow-icon')} />
            )}
          </span>
        </div>

        {/* 下拉面板 */}
        {open && !disabled && (
          <div
            className={prefixCls('select-dropdown')}
            role="listbox"
            id={listId}
            aria-multiselectable={multiple}
          >
            {loading ? (
              <div className={prefixCls('select-loading')}>
                <span className={prefixCls('select-loading-icon')} />
                加载中...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className={prefixCls('select-empty')}>无匹配选项</div>
            ) : (
              filteredOptions.map((opt, index) => {
                const selected = isSelected(currentValue, opt.value);
                const active = activeIndex === index;
                return (
                  <div
                    key={opt.value}
                    className={classNames(
                      prefixCls('select-option'),
                      selected && prefixCls('select-option-selected'),
                      active && prefixCls('select-option-active'),
                      opt.disabled && prefixCls('select-option-disabled'),
                    )}
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      if (opt.disabled) return;
                      handleSelect(opt.value);
                    }}
                  >
                    {multiple && (
                      <span className={prefixCls('select-option-checkbox')}>
                        {selected && <span className={prefixCls('select-option-check')} />}
                      </span>
                    )}
                    <span className={prefixCls('select-option-label')}>
                      {opt.label}
                    </span>
                    {!multiple && selected && (
                      <span className={prefixCls('select-option-tick')} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
