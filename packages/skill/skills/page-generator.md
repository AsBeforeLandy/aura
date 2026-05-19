---
name: aura-page-generator
description: Use when generating complete pages using Aura components - provides templates for common page patterns
---

# Aura 页面生成器

## 登录页

```tsx
import { Form, Input, Button, Card, Flex } from '@aura/ui';

function LoginPage() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Card variant="bordered" style={{ width: 400, padding: 'var(--aura-spacing-6)' }}>
        <Card.Header>
          <Card.Title level={3}>登录</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form layout="vertical" onFinish={(values) => console.log(values)}>
            <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
              <Input placeholder="your@email.com" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Button variant="primary" htmlType="submit" block>登录</Button>
          </Form>
        </Card.Body>
      </Card>
    </Flex>
  );
}
```

## 仪表盘页

```tsx
import { Card, Flex, Badge, Tag, Spin, Breadcrumb } from '@aura/ui';

function DashboardPage() {
  return (
    <Flex direction="column" gap="lg" style={{ padding: 'var(--aura-spacing-6)' }}>
      <Breadcrumb>
        <Breadcrumb.Item href="/">首页</Breadcrumb.Item>
        <Breadcrumb.Item>仪表盘</Breadcrumb.Item>
      </Breadcrumb>
      <Flex gap="md">
        <Card style={{ flex: 1 }}>
          <Card.Body>
            <Badge count={128} variant="primary">
              <Tag variant="primary">总用户</Tag>
            </Badge>
          </Card.Body>
        </Card>
        <Card style={{ flex: 1 }}>
          <Card.Body>
            <Badge count={12} variant="success">
              <Tag variant="success">在线</Tag>
            </Badge>
          </Card.Body>
        </Card>
      </Flex>
    </Flex>
  );
}
```

## 列表页

```tsx
import { Form, Input, Select, Button, Pagination, Flex, Card, Tag, Empty } from '@aura/ui';

function ListPage() {
  return (
    <Flex direction="column" gap="lg" style={{ padding: 'var(--aura-spacing-6)' }}>
      <Form layout="inline">
        <Form.Item name="keyword">
          <Input.Search placeholder="搜索关键词" />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="状态" options={[{ value: 'active', label: '活跃' }]} />
        </Form.Item>
        <Button variant="primary">查询</Button>
      </Form>
      <Card>
        <Card.Body>
          {/* 列表内容 */}
          <Empty description="暂无数据" />
        </Card.Body>
      </Card>
      <Flex justify="end">
        <Pagination total={100} pageSize={10} />
      </Flex>
    </Flex>
  );
}
```
