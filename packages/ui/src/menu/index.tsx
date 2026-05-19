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
import './index.less';

/* ===== Context ===== */
interface MenuContextValue {
  selectedKey: string | undefined;
  onSelect: (key: string) => void;
  mode: 'vertical' | 'horizontal' | 'inline';
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
  ({ itemKey, disabled = false, icon, className, style, children }, ref) => {
    const { selectedKey, onSelect } = useMenuContext();
    const isSelected = selectedKey === itemKey;

    const itemCls = classNames(
      prefixCls('menu-item'),
      isSelected && prefixCls('menu-item-selected'),
      disabled && prefixCls('menu-item-disabled'),
      className,
    );

    const handleClick = () => {
      if (disabled) return;
      onSelect(itemKey);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        className={itemCls}
        style={style}
        role="menuitem"
        aria-selected={isSelected}
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
    const { selectedKey } = useMenuContext();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 收集子项的 key，判断是否有子项被选中
    const childKeys = React.Children.map(children, (child) => {
      if (React.isValidElement(child) && (child.props as MenuItemProps).itemKey) {
        return (child.props as MenuItemProps).itemKey;
      }
      return null;
    })?.filter(Boolean) as string[] | undefined;
    const hasSelectedChild = !!childKeys?.some((key) => key === selectedKey);

    // 点击外部收起
    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

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
      setOpen((prev) => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <div ref={(node) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }} className={subCls} style={style} role="menu">
        <div
          className={titleCls}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          role="menuitem"
          tabIndex={0}
          aria-expanded={open}
        >
          {icon && <span className={prefixCls('menu-item-icon')}>{icon}</span>}
          <span className={prefixCls('menu-item-text')}>{title}</span>
          <span
            className={classNames(
              prefixCls('menu-submenu-arrow'),
              open && prefixCls('menu-submenu-arrow-open'),
            )}
          >
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
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
            prefixCls('menu-submenu-content'),
            open && prefixCls('menu-submenu-content-open'),
          )}
        >
          <div className={prefixCls('menu-submenu-inner')}>
            {children}
          </div>
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
  /** 选中回调 */
  onSelect?: (key: string) => void;
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
      onSelect,
      collapsible,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [internalKey, setInternalKey] = useState<string | undefined>(
      defaultSelectedKey,
    );
    const isControlled = controlledKey !== undefined;
    const activeKey = isControlled ? controlledKey : internalKey;

    const handleSelect = useCallback(
      (key: string) => {
        if (!isControlled) setInternalKey(key);
        onSelect?.(key);
      },
      [isControlled, onSelect],
    );

    const ctxValue: MenuContextValue = {
      selectedKey: activeKey,
      onSelect: handleSelect,
      mode,
    };

    const menuCls = classNames(
      prefixCls('menu'),
      prefixCls(`menu-${mode}`),
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
}

const Menu = MenuBase as unknown as MenuComponent;
Menu.Item = MenuItem;
Menu.SubMenu = SubMenu;
Menu.Group = MenuGroup;

export { Menu };
