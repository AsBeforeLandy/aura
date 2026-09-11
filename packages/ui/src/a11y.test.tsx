import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Empty,
  Flex,
  Input,
  Menu,
  Pagination,
  Popconfirm,
  Rate,
  Result,
  Select,
  Slider,
  Space,
  Spin,
  Steps,
  Switch,
  Tag,
  Textarea,
  Tooltip,
} from '@aura/ui';

/**
 * 无障碍（a11y）测试
 *
 * 目的：确保组件向外暴露的语义结构（role / label / aria-* / 标题层级）
 * 符合 axe-core 的基本规则，避免出现「图标按钮无名称」「表单控件无标签」
 * 这类对读屏用户完全不可用的缺陷。
 *
 * 环境限制：jsdom 不做真实布局与样式计算，因此 axe 的 color-contrast
 * 规则在此不生效；本文件覆盖的是语义层面。
 */

/** 渲染并断言无 axe 违规 */
async function expectNoViolations(ui: React.ReactElement) {
  const { container } = render(ui);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

const selectOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
];

describe('a11y — 通用', () => {
  it('Button（含纯图标场景需可访问名称）', async () => {
    await expectNoViolations(
      <Space>
        <Button>提交</Button>
        <Button variant="primary">主要操作</Button>
        <Button aria-label="关闭">×</Button>
      </Space>,
    );
  });

  it('Divider', async () => {
    await expectNoViolations(<Divider>分组标题</Divider>);
  });

  it('Space 与 Flex 布局容器', async () => {
    await expectNoViolations(
      <Space direction="vertical">
        <Flex gap={8}>
          <span>左</span>
          <span>右</span>
        </Flex>
      </Space>,
    );
  });

  it('Tag', async () => {
    await expectNoViolations(
      <Space>
        <Tag>默认</Tag>
        <Tag variant="success">成功</Tag>
      </Space>,
    );
  });

  it('Avatar 与 Badge', async () => {
    await expectNoViolations(
      <Space>
        <Avatar>李</Avatar>
        <Badge count={5}>
          <span>邮件</span>
        </Badge>
      </Space>,
    );
  });

  it('Card', async () => {
    await expectNoViolations(
      <Card>
        <p>卡片内容</p>
      </Card>,
    );
  });

  it('Empty 与 Result', async () => {
    await expectNoViolations(<Empty />);
    await expectNoViolations(<Result variant="success" title="操作成功" />);
  });

  it('Spin', async () => {
    await expectNoViolations(<Spin />);
  });
});

describe('a11y — 表单控件（必须可被标注）', () => {
  it('Input（有 label 关联）', async () => {
    await expectNoViolations(
      <label>
        用户名
        <Input placeholder="请输入" />
      </label>,
    );
  });

  it('Textarea', async () => {
    await expectNoViolations(
      <label>
        备注
        <Textarea placeholder="请输入备注" />
      </label>,
    );
  });

  it('Checkbox 与 Switch', async () => {
    await expectNoViolations(
      <Space direction="vertical">
        <Checkbox>同意条款</Checkbox>
        <Switch aria-label="启用通知" />
      </Space>,
    );
  });

  it('Select', async () => {
    // role="combobox" 落在 div 上，无法被 <label> 关联，必须用 aria-label
    await expectNoViolations(
      <Select options={selectOptions} placeholder="请选择" aria-label="水果" />,
    );
  });

  it('Slider 与 Rate', async () => {
    await expectNoViolations(
      <Space direction="vertical">
        <Slider aria-label="音量" />
        <Rate aria-label="评分" />
      </Space>,
    );
  });

  it('Slider（range 模式，两个滑块名称可区分）', async () => {
    await expectNoViolations(
      <Slider range defaultValue={[20, 60]} aria-label="价格区间" />,
    );
  });
});

describe('a11y — 导航与反馈', () => {
  it('Menu', async () => {
    await expectNoViolations(
      <Menu selectedKey="home" onSelect={() => {}}>
        <Menu.Item itemKey="home">首页</Menu.Item>
        <Menu.Item itemKey="settings">设置</Menu.Item>
      </Menu>,
    );
  });

  it('Breadcrumb', async () => {
    await expectNoViolations(
      <Breadcrumb>
        <Breadcrumb.Item href="/">首页</Breadcrumb.Item>
        <Breadcrumb.Item>列表</Breadcrumb.Item>
      </Breadcrumb>,
    );
  });

  it('Pagination', async () => {
    await expectNoViolations(
      <Pagination current={1} total={500} onChange={() => {}} />,
    );
  });

  it('Steps', async () => {
    await expectNoViolations(
      <Steps current={1}>
        <Steps.Step title="填写信息" />
        <Steps.Step title="确认" />
      </Steps>,
    );
  });

  it('Dropdown', async () => {
    await expectNoViolations(
      <Dropdown menu={[{ key: 'more', label: '更多操作' }]}>
        <Button>更多</Button>
      </Dropdown>,
    );
  });

  it('Tooltip 与 Popconfirm', async () => {
    await expectNoViolations(
      <Tooltip content="提示文案">
        <Button>悬停</Button>
      </Tooltip>,
    );
    await expectNoViolations(
      <Popconfirm title="确认删除？">
        <Button>删除</Button>
      </Popconfirm>,
    );
  });

  it('Alert', async () => {
    await expectNoViolations(
      <Alert variant="warning" title="注意" showIcon>
        这是一条警告提示
      </Alert>,
    );
  });
});
