import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import { ChevronDown, DoubleLeft, DoubleRight } from '@aura/icons';
import './index.less';

/* ===== Context ===== */
interface MenuContextValue {
  selectedKey: string | undefined;
  onSelect: (key: string) => void;
  /** 菜单项点击回调（含完整路径） */
  onClick?: (info: {
    key: string;
    keyPath: string[];
    domEvent: React.MouseEvent<HTMLDivElement>;
  }) => void;
  mode: 'vertical' | 'horizontal' | 'inline';
  /** 当前展开的子菜单 key 列表（Menu 统一管理，受控 / 非受控在此合并） */
  openKeys: string[];
  /** 切换子菜单展开状态 */
  toggleOpen: (subKey: string, nextOpen: boolean) => void;
  /** 从根到当前层级的 SubMenu key 路径（不含自身，用于构造 keyPath） */
  parentKeys: string[];
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('Menu 子组件必须在 Menu 内部使用');
  return ctx;
}

/* ===== Menu.Item ===== */
export interface MenuItemProps {
  /** 唯一标识（避免与 React key 冲突，使用 itemKey） */
  itemKey: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否危险操作（红色强调） */
  danger?: boolean;
  /** 图标 */
  icon?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    { itemKey, disabled = false, danger = false, icon, className, style, children },
    ref,
  ) => {
    const { selectedKey, onSelect, onClick, parentKeys } = useMenuContext();
    const isSelected = selectedKey === itemKey;

    const itemCls = classNames(
      prefixCls('menu-item'),
      isSelected && prefixCls('menu-item-selected'),
      disabled && prefixCls('menu-item-disabled'),
      danger && prefixCls('menu-item-danger'),
      className,
    );

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onSelect(itemKey);
      onClick?.({ key: itemKey, keyPath: [itemKey, ...parentKeys], domEvent: e });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    return (
      // 注意：role="menuitem" 不支持 aria-selected（axe 会报 aria-allowed-attr），
      // 用全局属性 aria-current 表达「当前选中项」，这也是导航菜单的惯用写法。
      <div
        ref={ref}
        className={itemCls}
        style={style}
        role="menuitem"
        aria-current={isSelected ? 'true' : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {icon && <span className={prefixCls('menu-item-icon')}>{icon}</span>}
        <span className={prefixCls('menu-item-text')}>{children}</span>
      </div>
    );
  },
);

MenuItem.displayName = 'Menu.Item';

/* ===== Menu.SubMenu ===== */
export interface SubMenuProps {
  /** 唯一标识 */
  subKey: string;
  /** 标题 */
  title?: React.ReactNode;
  /** 图标 */
  icon?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const SubMenu = forwardRef<HTMLDivElement, SubMenuProps>(
  ({ subKey, title, icon, className, style, children }, ref) => {
    const ctx = useMenuContext();
    const { selectedKey, openKeys, toggleOpen, parentKeys } = ctx;
    // 展开状态统一由 Menu 管理（openKeys 受控 / defaultOpenKeys 非受控在 Menu 层合并）
    const open = openKeys.includes(subKey);
    // 显式带上 `| null`：@types/react 18 下 `useRef<T>(null)` 返回只读的
    // RefObject，无法在 ref 回调中赋值；`useRef<T | null>(null)` 才是可变的。
    const containerRef = useRef<HTMLDivElement | null>(null);

    // subKey 为子菜单提供稳定标识：生成确定性的面板 id，
    // 供标题通过 aria-controls 关联，也便于测试与上层持久化展开状态。
    const panelId = subKey
      ? prefixCls(`menu-submenu-panel-${subKey}`)
      : undefined;

    // 收集子项的 key，判断是否有子项被选中
    const childKeys = React.Children.map(children, (child) => {
      if (React.isValidElement(child) && (child.props as MenuItemProps).itemKey) {
        return (child.props as MenuItemProps).itemKey;
      }
      return null;
    })?.filter(Boolean) as string[] | undefined;
    const hasSelectedChild = !!childKeys?.some((key) => key === selectedKey);

    // 点击外部收起（受控时经由 onOpenChange 通知调用方）
    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          toggleOpen(subKey, false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, subKey, toggleOpen]);

    const subCls = classNames(
      prefixCls('menu-submenu'),
      open && prefixCls('menu-submenu-open'),
      className,
    );

    const titleCls = classNames(
      prefixCls('menu-submenu-title'),
      hasSelectedChild && prefixCls('menu-submenu-title-selected'),
    );

    const handleToggle = () => {
      toggleOpen(subKey, !open);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={subCls}
        style={style}
        role="menu"
        data-sub-key={subKey}
      >
        <div
          className={titleCls}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          role="menuitem"
          tabIndex={0}
          aria-expanded={open}
          aria-controls={open && panelId ? panelId : undefined}
        >
          {icon && <span className={prefixCls('menu-item-icon')}>{icon}</span>}
          <span className={prefixCls('menu-item-text')}>{title}</span>
          <span
            className={classNames(
              prefixCls('menu-submenu-arrow'),
              open && prefixCls('menu-submenu-arrow-open'),
            )}
          >
            <ChevronDown size={12} />
          </span>
        </div>
        <div
          id={panelId}
          className={classNames(
            prefixCls('menu-submenu-content'),
            open && prefixCls('menu-submenu-content-open'),
          )}
        >
          {/* 嵌套 SubMenu 需要知道自己所处的路径（keyPath 用） */}
          <MenuContext.Provider
            value={{ ...ctx, parentKeys: [...parentKeys, subKey] }}
          >
            <div className={prefixCls('menu-submenu-inner')}>
              {children}
            </div>
          </MenuContext.Provider>
        </div>
      </div>
    );
  },
);

SubMenu.displayName = 'Menu.SubMenu';

/* ===== Menu.Group ===== */
export interface MenuGroupProps {
  /** 分组标题 */
  title?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const MenuGroup: React.FC<MenuGroupProps> = ({
  title,
  className,
  style,
  children,
}) => {
  const groupCls = classNames(prefixCls('menu-group'), className);

  return (
    <div className={groupCls} style={style} role="group">
      {title && (
        <div className={prefixCls('menu-group-title')} role="presentation">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

MenuGroup.displayName = 'Menu.Group';

/* ===== Menu.Divider ===== */
export interface MenuDividerProps {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const MenuDivider = forwardRef<HTMLDivElement, MenuDividerProps>(
  ({ className, style }, ref) => (
    <div
      ref={ref}
      className={classNames(prefixCls('menu-divider'), className)}
      style={style}
      role="separator"
    />
  ),
);

MenuDivider.displayName = 'Menu.Divider';

/* ===== Menu（主组件） ===== */
export interface MenuProps {
  /** 模式
   *  @default 'vertical'
   */
  mode?: 'vertical' | 'horizontal' | 'inline';
  /** 受控选中项 */
  selectedKey?: string;
  /** 默认选中项 */
  defaultSelectedKey?: string;
  /** 受控展开的子菜单 key 列表 */
  openKeys?: string[];
  /** 默认展开的子菜单 key 列表 */
  defaultOpenKeys?: string[];
  /** 子菜单展开变化回调（参数为展开后的完整 key 列表） */
  onOpenChange?: (openKeys: string[]) => void;
  /** 选中回调 */
  onSelect?: (key: string) => void;
  /** 菜单项点击回调（含完整路径 keyPath，叶子在前） */
  onClick?: (info: {
    key: string;
    keyPath: string[];
    domEvent: React.MouseEvent<HTMLDivElement>;
  }) => void;
  /** 是否可折叠（inline 模式下） */
  collapsible?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

const MenuBase = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      mode = 'vertical',
      selectedKey: controlledKey,
      defaultSelectedKey,
      openKeys: controlledOpenKeys,
      defaultOpenKeys = [],
      onOpenChange,
      onSelect,
      onClick,
      collapsible = false,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [internalKey, setInternalKey] = useState<string | undefined>(
      defaultSelectedKey,
    );
    const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(
      defaultOpenKeys,
    );
    // 折叠态仅由内部维护：折叠是纯展示形态，受控语义（openKeys / defaultOpenKeys）
    // 需要另立 API，这里不越权扩展
    const [collapsed, setCollapsed] = useState(false);
    const isControlled = controlledKey !== undefined;
    const activeKey = isControlled ? controlledKey : internalKey;

    const handleSelect = useCallback(
      (key: string) => {
        if (!isControlled) setInternalKey(key);
        onSelect?.(key);
      },
      [isControlled, onSelect],
    );

    const openKeys = controlledOpenKeys ?? internalOpenKeys;
    const handleToggleOpen = useCallback(
      (subKey: string, nextOpen: boolean) => {
        const next = nextOpen
          ? [...new Set([...openKeys, subKey])]
          : openKeys.filter((k) => k !== subKey);
        if (controlledOpenKeys === undefined) setInternalOpenKeys(next);
        onOpenChange?.(next);
      },
      [controlledOpenKeys, openKeys, onOpenChange],
    );

    const ctxValue: MenuContextValue = {
      selectedKey: activeKey,
      onSelect: handleSelect,
      onClick,
      mode,
      openKeys,
      toggleOpen: handleToggleOpen,
      parentKeys: [],
    };

    // 折叠只对纵向菜单有意义；横向菜单本就横向排布，没有可折叠的宽度收益
    const canCollapse = collapsible && mode !== 'horizontal';

    const menuCls = classNames(
      prefixCls('menu'),
      prefixCls(`menu-${mode}`),
      canCollapse && collapsed && prefixCls('menu-collapsed'),
      className,
    );

    return (
      <MenuContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={menuCls}
          style={style}
          role="menu"
          aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
        >
          {canCollapse && (
            <button
              type="button"
              className={prefixCls('menu-collapse-trigger')}
              aria-label={collapsed ? '展开菜单' : '折叠菜单'}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <DoubleRight size={14} /> : <DoubleLeft size={14} />}
            </button>
          )}
          {children}
        </div>
      </MenuContext.Provider>
    );
  },
);

MenuBase.displayName = 'Menu';

/* ===== 复合组件导出 ===== */
interface MenuComponent
  extends React.ForwardRefExoticComponent<
    MenuProps & React.RefAttributes<HTMLDivElement>
  > {
  Item: typeof MenuItem;
  SubMenu: typeof SubMenu;
  Group: typeof MenuGroup;
  Divider: typeof MenuDivider;
}

const Menu = MenuBase as unknown as MenuComponent;
Menu.Item = MenuItem;
Menu.SubMenu = SubMenu;
Menu.Group = MenuGroup;
Menu.Divider = MenuDivider;

export { Menu };
