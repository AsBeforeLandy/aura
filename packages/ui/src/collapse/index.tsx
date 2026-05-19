import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== Collapse Context ===== */

interface CollapseContextValue {
  /** 当前展开的 key 列表 */
  activeKeys: string[];
  /** 切换面板 */
  toggle: (key: string) => void;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

/* ===== CollapseItem ===== */

export interface CollapseItemProps {
  /** 面板唯一标识（避免与 React key 冲突，使用 itemKey） */
  itemKey: string;
  /** 面板标题 */
  title: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 面板内容 */
  children?: React.ReactNode;
}

const CollapseItem = forwardRef<HTMLDivElement, CollapseItemProps>(
  ({ itemKey, title, disabled = false, className, style, children }, ref) => {
    const ctx = useContext(CollapseContext);
    if (!ctx) {
      throw new Error('Collapse.Item must be used within a Collapse component');
    }

    const { activeKeys, toggle } = ctx;
    const isActive = activeKeys.includes(itemKey);
    const contentRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

    // 展开时计算 scrollHeight
    useEffect(() => {
      if (isActive && contentRef.current) {
        setMaxHeight(contentRef.current.scrollHeight);
      } else {
        setMaxHeight(undefined);
      }
    }, [isActive]);

    const itemCls = classNames(
      prefixCls('collapse-item'),
      isActive && prefixCls('collapse-item-active'),
      disabled && prefixCls('collapse-item-disabled'),
      className,
    );

    const handleClick = () => {
      if (disabled) return;
      toggle(itemKey);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    const contentStyle: React.CSSProperties = isActive
      ? { maxHeight: maxHeight ?? 0, overflow: 'hidden' }
      : { maxHeight: 0, overflow: 'hidden' };

    return (
      <div ref={ref} className={itemCls} style={style}>
        <div
          className={prefixCls('collapse-header')}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isActive}
          aria-disabled={disabled}
        >
          <span className={prefixCls('collapse-header-text')}>{title}</span>
          <span
            className={classNames(
              prefixCls('collapse-arrow'),
              isActive && prefixCls('collapse-arrow-active'),
            )}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
        <div
          className={classNames(
            prefixCls('collapse-content'),
            isActive && prefixCls('collapse-content-active'),
          )}
          style={contentStyle}
        >
          <div ref={contentRef} className={prefixCls('collapse-content-inner')}>
            {children}
          </div>
        </div>
      </div>
    );
  },
);

CollapseItem.displayName = 'Collapse.Item';

/* ===== Collapse（主组件） ===== */

export interface CollapseProps {
  /** 是否为手风琴模式（同时只展开一个） */
  accordion?: boolean;
  /** 默认展开的面板 key（非受控） */
  defaultActiveKey?: string | string[];
  /** 当前展开的面板 key（受控） */
  activeKey?: string | string[];
  /** 展开变化回调 */
  onChange?: (keys: string[]) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const CollapseBase = forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      accordion = false,
      defaultActiveKey = [],
      activeKey: controlledActiveKey,
      onChange,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const normalizeKeys = (keys: string | string[]): string[] => {
      return Array.isArray(keys) ? keys : [keys];
    };

    const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
      normalizeKeys(defaultActiveKey),
    );

    const activeKeys =
      controlledActiveKey !== undefined
        ? normalizeKeys(controlledActiveKey)
        : internalActiveKeys;

    const toggle = useCallback(
      (key: string) => {
        let nextKeys: string[];

        if (activeKeys.includes(key)) {
          // 收起
          nextKeys = activeKeys.filter((k) => k !== key);
        } else {
          // 展开
          if (accordion) {
            nextKeys = [key];
          } else {
            nextKeys = [...activeKeys, key];
          }
        }

        if (controlledActiveKey === undefined) {
          setInternalActiveKeys(nextKeys);
        }
        onChange?.(nextKeys);
      },
      [activeKeys, accordion, controlledActiveKey, onChange],
    );

    const ctx: CollapseContextValue = {
      activeKeys,
      toggle,
    };

    const cls = classNames(prefixCls('collapse'), className);

    return (
      <CollapseContext.Provider value={ctx}>
        <div ref={ref} className={cls} style={style}>
          {children}
        </div>
      </CollapseContext.Provider>
    );
  },
);

CollapseBase.displayName = 'Collapse';

/* ===== 复合组件导出 ===== */

interface CollapseComponent
  extends React.ForwardRefExoticComponent<
    CollapseProps & React.RefAttributes<HTMLDivElement>
  > {
  Item: typeof CollapseItem;
}

const Collapse = CollapseBase as unknown as CollapseComponent;
Collapse.Item = CollapseItem;

export { Collapse };
