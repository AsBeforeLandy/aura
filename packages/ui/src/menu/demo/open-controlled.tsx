import React, { useState } from 'react';
import { Menu } from '@aura-react-comp/ui';

/** openKeys 受控：子菜单展开状态由外部管理（典型场景：与路由/布局联动、持久化展开状态）。 */
export default () => {
  const [openKeys, setOpenKeys] = useState<string[]>(['workspace']);

  return (
    <div style={{ width: 240 }}>
      <Menu
        mode="inline"
        defaultSelectedKey="overview"
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onClick={({ key, keyPath }) => {
          console.log('点击：', key, '路径：', keyPath.join(' > '));
        }}      >
        <Menu.Item itemKey="overview">总览</Menu.Item>
        <Menu.SubMenu subKey="workspace" title="工作台">
          <Menu.Item itemKey="project">项目管理</Menu.Item>
          <Menu.Item itemKey="member">成员管理</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu subKey="settings" title="设置">
          <Menu.Item itemKey="profile">个人资料</Menu.Item>
          <Menu.Divider />
          <Menu.Item itemKey="logout" danger>
            退出登录
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
      <p style={{ marginTop: 12, color: 'var(--aura-text-secondary)', fontSize: 13 }}>
        当前展开：{openKeys.length > 0 ? openKeys.join('、') : '（无）'}
      </p>
    </div>
  );
};
