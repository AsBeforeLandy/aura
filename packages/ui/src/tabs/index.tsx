import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

/* ===== Context ===== */
interface TabsContextValue {
  activeKey: string;
  onChange: (key: string) => void;
  variant: 'default' | 'card' | 'pill';
  size: 'sm' | 'md' | 'lg';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabItem 必须在 Tabs 内部使用');
  return ctx;
}

/* ===== TabItem ===== */
export interface TabItemProps {
  /** 唯一标识，用于匹配激活状态 */
  tabKey: string;
  /** 选项卡标题 */
  title: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选项卡内容 */
  children?: React.ReactNode;
}

/** 内部组件：单个选项卡面板 */
const TabItem: React.FC<TabItemProps> = ({ children }) => {
  const { activeKey } = useTabsContext();
  // 只渲染占位，不显示内容 —— Tabs 组件自己控制渲染
  void activeKey;
  return <>{children}</>;
};

TabItem.displayName = 'TabItem';

/* ===== Tabs ===== */
export interface TabsProps {
  /** 默认激活的 tabKey */
  defaultActiveKey?: string;
  /** 受控激活的 tabKey */
  activeKey?: string;
  /** 变体样式
   *  @default 'default'
   */
  variant?: 'default' | 'card' | 'pill';
  /** 尺寸
   *  @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /** 切换回调 */
  onChange?: (key: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultActiveKey,
      activeKey: controlledActiveKey,
      variant = 'default',
      size = 'md',
      onChange,
      className,
      style,
      children,
    },
    ref,
  ) => {
    /* --- 受控/非受控 --- */
    const [internalKey, setInternalKey] = useState<string | undefined>(
      defaultActiveKey,
    );
    const isControlled = controlledActiveKey !== undefined;
    const activeKey = isControlled ? controlledActiveKey : internalKey;

    /* --- 从 children 提取 tab 信息 --- */
    const tabItems: {
      tabKey: string;
      title: React.ReactNode;
      disabled: boolean;
      children: React.ReactNode;
    }[] = [];

    React.Children.forEach(children, (child) => {
      if (React.isValidElement<TabItemProps>(child) && child.type === TabItem) {
        const { tabKey, title, disabled, children: content } = child.props;
        tabItems.push({
          tabKey,
          title,
          disabled: !!disabled,
          children: content,
        });
      }
    });

    // 如果没有 activeKey，取第一个
    const resolvedActiveKey =
      activeKey ?? tabItems[0]?.tabKey ?? '';

    const handleChange = useCallback(
      (key: string) => {
        if (!isControlled) setInternalKey(key);
        onChange?.(key);
      },
      [isControlled, onChange],
    );

    /* --- 指示器定位（仅 default variant） --- */
    const navRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});

    const updateIndicator = useCallback(() => {
      if (variant !== 'default' || !navRef.current) return;
      const activeTab = navRef.current.querySelector<HTMLElement>(
        `[data-tab-key="${resolvedActiveKey}"]`,
      );
      if (activeTab) {
        const navRect = navRef.current.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        setIndicatorStyle({
          width: tabRect.width,
          transform: `translateX(${tabRect.left - navRect.left}px)`,
        });
      }
    }, [variant, resolvedActiveKey]);

    // 用 useLayoutEffect 保证指示器在渲染后同步更新，避免闪烁
    const useIsomorphicLayoutEffect =
      typeof window !== 'undefined' ? useLayoutEffect : useEffect;
    useIsomorphicLayoutEffect(() => {
      updateIndicator();
    }, [updateIndicator]);

    /* --- 查找当前激活的内容 --- */
    const activeContent = tabItems.find(
      (item) => item.tabKey === resolvedActiveKey,
    )?.children;

    /* --- className --- */
    const wrapperCls = classNames(
      prefixCls('tabs'),
      prefixCls(`tabs-${variant}`),
      prefixCls(`tabs-${size}`),
      className,
    );

    const ctxValue: TabsContextValue = {
      activeKey: resolvedActiveKey,
      onChange: handleChange,
      variant,
      size,
    };

    return (
      <TabsContext.Provider value={ctxValue}>
        <div ref={ref} className={wrapperCls} style={style}>
          {/* Tab Bar */}
          <div ref={navRef} className={prefixCls('tabs-nav')} role="tablist">
            {tabItems.map((item) => {
              const isActive = item.tabKey === resolvedActiveKey;
              const tabCls = classNames(
                prefixCls('tabs-tab'),
                isActive && prefixCls('tabs-tab-active'),
                item.disabled && prefixCls('tabs-tab-disabled'),
              );

              return (
                <button
                  key={item.tabKey}
                  type="button"
                  role="tab"
                  data-tab-key={item.tabKey}
                  className={tabCls}
                  aria-selected={isActive}
                  aria-disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) handleChange(item.tabKey);
                  }}
                >
                  {item.title}
                </button>
              );
            })}
            {/* 指示器（仅 default variant） */}
            {variant === 'default' && (
              <span
                className={prefixCls('tabs-indicator')}
                style={indicatorStyle}
              />
            )}
          </div>

          {/* Tab 面板 */}
          <div className={prefixCls('tabs-content')} role="tabpanel">
            <div
              key={resolvedActiveKey}
              className={prefixCls('tabs-panel')}
            >
              {activeContent}
            </div>
          </div>
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = 'Tabs';

// 子组件挂载
const TabsCompound = Tabs as unknown as TabsComponent;
TabsCompound.Tab = TabItem;

// 导出复合类型
export interface TabsComponent
  extends React.ForwardRefExoticComponent<
    TabsProps & React.RefAttributes<HTMLDivElement>
  > {
  Tab: typeof TabItem;
}

export const TabsWithSub = Tabs as TabsComponent;

export { TabItem };
export default Tabs as TabsComponent;
