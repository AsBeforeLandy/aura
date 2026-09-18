import React, { useRef, useState } from 'react';
import { classNames, prefixCls } from '@aura/shared';
import './index.less';

export interface ConversationItem {
  key: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  timestamp?: React.ReactNode;
}

export interface ConversationMenuItem {
  key: React.Key;
  label: React.ReactNode;
  danger?: boolean;
}

export interface ConversationMenuConfig {
  /** 菜单触发按钮的图标（默认 …） */
  icon?: React.ReactNode;
  items: ConversationMenuItem[];
  onClick: (item: ConversationItem, menuItemKey: React.Key) => void;
}

export interface ConversationsProps {
  items: ConversationItem[];
  /** 当前激活会话 */
  activeKey?: React.Key;
  onActiveChange?: (key: React.Key) => void;
  /** 每条会话的操作菜单（重命名 / 置顶 / 删除等），传入后显示 … 触发按钮 */
  menu?: (item: ConversationItem) => ConversationMenuConfig;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Conversations — 会话管理列表。
 *
 * 多会话应用的侧栏：激活高亮、时间戳、可选操作菜单（重命名 / 删除等，
 * 由 `menu` 配置注入，组件只负责展示与回调）。
 */
export const Conversations: React.FC<ConversationsProps> = ({
  items,
  activeKey,
  onActiveChange,
  menu,
  className,
  style,
}) => {
  // 同一时刻至多展开一个操作菜单
  const [openMenuKey, setOpenMenuKey] = useState<React.Key | null>(null);
  const openKeyRef = useRef<React.Key | null>(null);
  openKeyRef.current = openMenuKey;

  return (
    <div
      className={classNames(prefixCls('x-conversations'), className)}
      style={style}
      onClick={() => setOpenMenuKey(null)}
    >
      <ul className={prefixCls('x-conversations-list')} role="list">
        {items.map((item) => {
          const isActive = activeKey !== undefined && item.key === activeKey;
          const menuConfig = menu?.(item);
          const menuOpen = openMenuKey !== null && item.key === openMenuKey;

          return (
            <li key={item.key} role="listitem">
              <div
                className={classNames(
                  prefixCls('x-conversations-item'),
                  isActive && prefixCls('x-conversations-item--active'),
                )}
              >
                <button
                  type="button"
                  className={prefixCls('x-conversations-item-main')}
                  onClick={() => {
                    setOpenMenuKey(null);
                    onActiveChange?.(item.key);
                  }}
                >
                  {item.icon ? (
                    <span className={prefixCls('x-conversations-item-icon')}>
                      {item.icon}
                    </span>
                  ) : null}
                  <span className={prefixCls('x-conversations-item-label')}>
                    {item.label}
                  </span>
                  {item.timestamp ? (
                    <span className={prefixCls('x-conversations-item-time')}>
                      {item.timestamp}
                    </span>
                  ) : null}
                </button>
                {menuConfig ? (
                  <span
                    className={prefixCls('x-conversations-item-menu')}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={classNames(
                        prefixCls('x-conversations-menu-btn'),
                        menuOpen && prefixCls('x-conversations-menu-btn--open'),
                      )}
                      aria-label="会话操作"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuKey(menuOpen ? null : item.key);
                      }}
                    >
                      {menuConfig.icon ?? '…'}
                    </button>
                    {menuOpen ? (
                      <span
                        className={prefixCls('x-conversations-menu')}
                        role="menu"
                      >
                        {menuConfig.items.map((menuItem) => (
                          <button
                            key={menuItem.key}
                            type="button"
                            role="menuitem"
                            className={classNames(
                              prefixCls('x-conversations-menu-item'),
                              menuItem.danger &&
                                prefixCls('x-conversations-menu-item--danger'),
                            )}
                            onClick={(event) => {
                              event.stopPropagation();
                              menuConfig.onClick(item, menuItem.key);
                              setOpenMenuKey(null);
                            }}
                          >
                            {menuItem.label}
                          </button>
                        ))}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

Conversations.displayName = 'Conversations';
