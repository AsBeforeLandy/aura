import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from '@aura-react-comp/motion';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Text,
  Tooltip,
} from '@aura-react-comp/ui';

/** 组件演示墙：6 个场景自动轮播（悬停暂停、点击指示器切换） */

const SCENE_H = 240;

function SceneBasics() {
  return (
    <Space direction="vertical" size="md">
      <Space wrap size="sm">
        <Button variant="primary">主要按钮</Button>
        <Button variant="default">次要按钮</Button>
        <Button variant="dashed">虚线按钮</Button>
        <Button variant="text">文字按钮</Button>
        <Button variant="link">链接按钮</Button>
      </Space>
      <Space wrap size="sm">
        <Tag>默认标签</Tag>
        <Tag variant="primary">紫罗兰</Tag>
        <Tag variant="success">成功</Tag>
        <Tag variant="error">危险</Tag>
      </Space>
    </Space>
  );
}

function SceneForm() {
  return (
    <Space
      direction="vertical"
      size="md"
      style={{ width: '100%', maxWidth: 420 }}
    >
      <Input placeholder="请输入项目名称" defaultValue="Aura Design System" />
      <Select
        placeholder="请选择角色"
        defaultValue="admin"
        options={[
          { label: '管理员', value: 'admin' },
          { label: '成员', value: 'member' },
        ]}
      />
      <Space align="center" size="lg">
        <Space align="center" size="sm">
          <Switch defaultChecked />
          <Text>开启通知</Text>
        </Space>
        <Checkbox defaultChecked>记住选择</Checkbox>
      </Space>
    </Space>
  );
}

function SceneDisplay() {
  return (
    <Space size="lg" wrap align="center">
      <Card style={{ width: 200 }}>
        <Card.Body>
          <Space direction="vertical" size="sm">
            <Space align="center" size="sm">
              <Avatar>A</Avatar>
              <Text>李振虎</Text>
              <Badge count={3} />
            </Space>
            <Text>前端工程师 · 杭州</Text>
          </Space>
        </Card.Body>
      </Card>
      <Space direction="vertical" size="sm">
        <Tooltip content="悬停查看提示">
          <Button variant="default">悬停我</Button>
        </Tooltip>
        <Space align="center" size="sm">
          <Badge count={12}>
            <Avatar>B</Avatar>
          </Badge>
          <Badge dot>
            <Avatar>C</Avatar>
          </Badge>
        </Space>
      </Space>
    </Space>
  );
}

function SceneFeedback() {
  return (
    <Space
      direction="vertical"
      size="sm"
      style={{ width: '100%', maxWidth: 480 }}
    >
      <Alert variant="info" showIcon title="提示">
        组件令牌支持运行时切换，无需重新构建。
      </Alert>
      <Alert variant="success" showIcon title="成功">
        主题已切换为暗色模式。
      </Alert>
      <Alert variant="warning" showIcon title="注意">
        该操作将影响所有子组件。
      </Alert>
      <Space align="center" size="md" style={{ paddingTop: 4 }}>
        <Spin size="sm" />
        <Text>正在加载…</Text>
      </Space>
    </Space>
  );
}

function SceneTypography() {
  return (
    <Space
      direction="vertical"
      size="md"
      style={{ width: '100%', maxWidth: 460 }}
    >
      <Text style={{ fontSize: 22, fontWeight: 600 }}>紫罗兰视觉语言</Text>
      <Text>以 #7c3aed 为主色精心调配的色阶，克制而有辨识度。</Text>
      <Divider />
      <Text>CSS Variables 驱动 · 双模式主题 · 无障碍优先</Text>
    </Space>
  );
}

function SceneLayout() {
  return (
    <Space direction="vertical" size="md" style={{ width: '100%' }}>
      <Space wrap size="sm">
        {['Space', 'Flex', 'Layout', 'Divider', 'Grid'].map((label) => (
          <Card key={label} style={{ padding: '12px 16px' }}>
            <Text>{label}</Text>
          </Card>
        ))}
      </Space>
      <Divider />
      <Empty />
    </Space>
  );
}

const SCENES: {
  key: string;
  title: string;
  tag: string;
  render: () => React.ReactElement;
}[] = [
  {
    key: 'basics',
    title: '基础控件',
    tag: 'Button / Tag',
    render: () => <SceneBasics />,
  },
  {
    key: 'form',
    title: '表单输入',
    tag: 'Input / Select / Switch / Checkbox',
    render: () => <SceneForm />,
  },
  {
    key: 'display',
    title: '数据展示',
    tag: 'Card / Avatar / Badge / Tooltip',
    render: () => <SceneDisplay />,
  },
  {
    key: 'feedback',
    title: '反馈提示',
    tag: 'Alert / Spin',
    render: () => <SceneFeedback />,
  },
  {
    key: 'typography',
    title: '排版与分隔',
    tag: 'Typography / Divider',
    render: () => <SceneTypography />,
  },
  {
    key: 'layout',
    title: '布局与空态',
    tag: 'Space / Card / Empty',
    render: () => <SceneLayout />,
  },
];

export default () => {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setCur((c) => (c + 1) % SCENES.length),
      3800,
    );
    return () => clearInterval(timer);
  }, [paused, cur]);

  const go = useCallback((i: number) => setCur(i), []);
  const scene = SCENES[cur];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        border: '1px solid #e8e6de',
        borderRadius: 16,
        background: '#faf9f5',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '14px 20px 0',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{scene.title}</div>
          <div style={{ color: '#8a8984', fontSize: 12, marginTop: 2 }}>
            {scene.tag}
          </div>
        </div>
        <div style={{ color: '#b4b2a9', fontSize: 12 }}>
          {paused ? '已暂停' : '自动轮播'}
        </div>
      </div>

      <div
        style={{
          height: SCENE_H,
          padding: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {scene.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          padding: '0 0 16px',
        }}
      >
        {SCENES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={s.title}
            onClick={() => go(i)}
            style={{
              width: i === cur ? 22 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: i === cur ? '#7c3aed' : '#d3d1c7',
              transition: 'all 260ms cubic-bezier(0.21, 0.47, 0.32, 0.98)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
