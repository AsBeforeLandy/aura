import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface DropdownMenuItem {
  /** 菜单项唯一标识 */
  key: string;
  /** 菜单项显示内容 */
  label: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为危险操作样式 */
  danger?: boolean;
}

export interface DropdownProps {
  /** 菜单项列表 */
  menu: DropdownMenuItem[];
  /** 触发方式
   *  @default 'hover'
   */
  trigger?: 'hover' | 'click';
  /** 弹出方位
   *  @default 'bottom'
   */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  /** 是否显示箭头
   *  @default false
   */
  arrow?: boolean;
  /** 是否禁用下拉菜单 */
  disabled?: boolean;
  /** 菜单项点击回调 */
  onMenuClick?: (key: string) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 触发元素（仅接受单个 ReactElement） */
  children: React.ReactElement;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      menu,
      trigger = 'hover',
      placement = 'bottom',
      arrow = false,
      disabled = false,
      onMenuClick,
      className,
      style,
      children,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 显示菜单
    const show = useCallback(() => {
      if (disabled) return;
      setAnimating(true);
      setVisible(true);
    }, [disabled]);

    // 隐藏菜单
    const hide = useCallback(() => {
      setAnimating(false);
      setTimeout(() => setVisible(false), 150);
    }, []);

    // 切换菜单
    const toggle = useCallback(() => {
      if (disabled) return;
      if (visible) {
        hide();
      } else {
        show();
      }
    }, [disabled, visible, show, hide]);

    // 点击外部关闭
    useEffect(() => {
      if (!visible) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        ) {
          hide();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [visible, hide]);

    // 构建子元素的 props
    const childProps: Record<string, unknown> = {};
    const childOwnProps = children.props as Record<string, unknown>;

    if (trigger === 'hover') {
      childProps.onMouseEnter = (e: React.MouseEvent) => {
        show();
        (childOwnProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e);
      };
      childProps.onMouseLeave = (e: React.MouseEvent) => {
        hide();
        (childOwnProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
      };
    } else if (trigger === 'click') {
      childProps.onClick = (e: React.MouseEvent) => {
        toggle();
        (childOwnProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
      };
    }

    // 菜单项点击处理
    const handleMenuClick = (item: DropdownMenuItem) => {
      if (item.disabled) return;
      onMenuClick?.(item.key);
      hide();
    };

    const wrapperCls = classNames(
      prefixCls('dropdown'),
      className,
    );

    const menuCls = classNames(
      prefixCls('dropdown-menu'),
      prefixCls(`dropdown-menu-${placement}`),
      animating && prefixCls('dropdown-menu-visible'),
    );

    return (
      <div ref={ref || wrapperRef} className={wrapperCls} style={style}>
        {React.cloneElement(children, childProps)}
        {visible && menu.length > 0 && (
          <div
            className={menuCls}
            role="menu"
            aria-label="下拉菜单"
            onMouseEnter={trigger === 'hover' ? show : undefined}
            onMouseLeave={trigger === 'hover' ? hide : undefined}
          >
            {arrow && <div className={prefixCls('dropdown-arrow')} />}
            {menu.map((item) => {
              const itemCls = classNames(
                prefixCls('dropdown-menu-item'),
                item.disabled && prefixCls('dropdown-menu-item-disabled'),
                item.danger && prefixCls('dropdown-menu-item-danger'),
              );
              return (
                <div
                  key={item.key}
                  className={itemCls}
                  role="menuitem"
                  aria-disabled={item.disabled}
                  onClick={() => handleMenuClick(item)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
