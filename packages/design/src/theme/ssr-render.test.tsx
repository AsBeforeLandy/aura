// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  ThemeProvider,
  useTheme,
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Slider,
  Tag,
  Alert,
  Empty,
  Spin,
} from '../index';

/**
 * SSR 渲染回归：在无 DOM 的真实 Node 环境用 renderToString 渲染。
 * 渲染期（render body / render phase）任何 document / window 访问都会直接抛错，
 * 以此锁住「渲染期 SSR 安全」；effect 内的浏览器 API（如 ThemeProvider 写
 * document.documentElement.dataset）在服务端不执行，属预期行为。
 */

function ThemeProbe() {
  const theme = useTheme();
  return <div data-testid="theme-probe">{theme.mode}</div>;
}

describe('design 包 SSR 渲染', () => {
  it('ThemeProvider + useTheme 消费者可服务端渲染，且不写根元素属性', () => {
    const html = renderToString(
      <ThemeProvider theme="dark">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(html).not.toBe('');
    expect(html).toContain('theme-probe');
    // 主题属性写入在 effect 中，服务端输出（水合前）不应包含
    expect(html).not.toContain('data-mode="');
    expect(html).not.toContain('data-theme="');
  });

  it('组件电池可服务端渲染不抛错', () => {
    const html = renderToString(
      <ThemeProvider theme="light">
        <Button>按钮</Button>
        <Input placeholder="输入" />
        <Textarea autoSize placeholder="多行" />
        <Select options={[{ label: '选项一', value: 'a' }]} value="a" />
        <Switch />
        <Slider />
        <Tag>标签</Tag>
        <Alert title="提示">描述</Alert>
        <Empty />
        <Spin />
      </ThemeProvider>,
    );

    expect(html).not.toBe('');
  });
});
