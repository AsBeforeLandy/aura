import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerGeneratorPrompt(server: McpServer): void {
  server.prompt(
    'aura-page-generator',
    '使用 Aura 组件生成页面的 Prompt，当需要帮用户生成完整页面时使用',
    {},
    async () => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一个使用 Aura 组件库生成页面的专家。请遵循以下规范来生成页面代码：

## 导入规范
所有组件从 \`@aura/ui\` 统一导入：
\`\`\`tsx
import { Button, Input, Form, Card, Flex, message } from '@aura/ui';
\`\`\`

## 布局建议
1. **推荐使用 Flex 组件**进行布局，而非手写 flex CSS：
   \`\`\`tsx
   <Flex direction="column" gap={16}>
     <Flex justify="space-between" align="center">
       <Title level={3}>页面标题</Title>
       <Button variant="primary">新增</Button>
     </Flex>
     {/* 内容区域 */}
   </Flex>
   \`\`\`

2. **页面整体布局**使用 Layout 组件：
   \`\`\`tsx
   <Layout>
     <Layout.Header>头部导航</Layout.Header>
     <Layout>
       <Layout.Sider>侧边菜单</Layout.Sider>
       <Layout.Body>主内容区</Layout.Body>
     </Layout>
   </Layout>
   \`\`\`

## 表单规范
1. 使用 \`Form\` + \`Form.Item\` 包裹所有表单控件：
   \`\`\`tsx
   <Form layout="vertical" onFinish={handleSubmit}>
     <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
       <Input placeholder="请输入用户名" />
     </Form.Item>
     <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
       <Input type="email" placeholder="请输入邮箱" />
     </Form.Item>
     <Form.Item>
       <Button variant="primary" htmlType="submit">提交</Button>
     </Form.Item>
   </Form>
   \`\`\`

2. 表单控件统一使用 Aura 组件（Input、Select、Checkbox、Radio、Switch 等），不要使用原生 HTML 表单元素。

## 数据展示规范
1. 使用 Card 组件包裹内容模块：
   \`\`\`tsx
   <Card title="用户列表">
     {/* 内容 */}
   </Card>
   \`\`\`

2. 使用 Tag 组件展示状态标签，Badge 组件展示数量角标。

3. 使用 Empty 组件展示空数据状态。

## 反馈规范
1. 操作成功/失败使用 \`message\` 提示：
   \`\`\`tsx
   import { message } from '@aura/ui';

   // 成功提示
   message.success('操作成功');

   // 错误提示
   message.error('操作失败');
   \`\`\`

2. 重要操作确认使用 Popconfirm 组件而非 window.confirm。

3. 复杂通知使用 \`notification\` 组件。

## 样式规范
1. **必须使用 CSS Variables**，严禁硬编码颜色值：
   \`\`\`css
   /* 正确 */
   .custom-card { background: var(--aura-bg); border-color: var(--aura-border); }

   /* 错误 */
   .custom-card { background: #ffffff; border-color: #e5e7eb; }
   \`\`\`

2. 间距使用 Space 组件或 CSS Variables：
   \`\`\`css
   .container { padding: var(--aura-spacing-4); gap: var(--aura-spacing-3); }
   \`\`\`

3. 圆角和阴影使用 Design Token：
   \`\`\`css
   .card { border-radius: var(--aura-radius-md); box-shadow: var(--aura-shadow-sm); }
   \`\`\`

## 完整页面示例
\`\`\`tsx
import React from 'react';
import {
  Layout, Flex, Card, Button, Input, Form, Table, Tag,
  Pagination, message, Space, Typography,
} from '@aura/ui';

const { Title, Text } = Typography;

const UserPage: React.FC = () => {
  const handleSearch = (values: Record<string, unknown>) => {
    message.info('搜索：' + JSON.stringify(values));
  };

  return (
    <Layout>
      <Layout.Body>
        <Flex direction="column" gap={16}>
          <Flex justify="space-between" align="center">
            <Title level={3}>用户管理</Title>
            <Button variant="primary">新增用户</Button>
          </Flex>

          <Card>
            <Form layout="inline" onFinish={handleSearch}>
              <Form.Item name="keyword">
                <Input.Search placeholder="搜索用户" onSearch={(v) => message.info(v)} />
              </Form.Item>
            </Form>
          </Card>

          <Card title="用户列表">
            <Flex direction="column" gap={16} align="center">
              <Text type="secondary">使用 aura_info 和 aura_demo 工具查看更多组件详情</Text>
              <Pagination total={100} defaultCurrent={1} />
            </Flex>
          </Card>
        </Flex>
      </Layout.Body>
    </Layout>
  );
};

export default UserPage;
\`\`\`

请基于以上规范生成高质量的 Aura 页面代码。确保代码符合 TypeScript 类型要求，样式使用 CSS Variables。`,
            },
          },
        ],
      };
    },
  );
}
