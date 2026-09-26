import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { FileCard, formatFileSize, getFileExt } from './index';

describe('FileCard', () => {
  it('正常：渲染文件名、格式化大小与扩展名徽标', () => {
    const { container } = render(
      <FileCard name="report.pdf" size={1024 * 1024 * 1.5} />,
    );

    expect(screen.getByText('report.pdf')).toBeDefined();
    expect(screen.getByText('1.5 MB')).toBeDefined();
    expect(container.querySelector('.aura-x-file-card-ext')?.textContent).toBe(
      'pdf',
    );
  });

  it('正常：uploading 渲染进度条与百分比', () => {
    const { container } = render(
      <FileCard name="a.png" status="uploading" percent={45} />,
    );

    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('aria-valuenow')).toBe('45');
    expect(screen.getByText('45%')).toBeDefined();
  });

  it('正常：done 状态带完成态类名', () => {
    const { container } = render(<FileCard name="a.png" status="done" />);
    expect(container.firstElementChild?.className).toContain(
      'aura-x-file-card--done',
    );
  });

  it('正常：error 状态显示失败原因并顶替 description', () => {
    render(
      <FileCard
        name="a.pdf"
        status="error"
        description="普通描述"
        errorTip="网络中断"
      />,
    );

    expect(screen.getByText('网络中断')).toBeDefined();
    expect(screen.queryByText('普通描述')).toBeNull();
  });

  it('正常：onRemove 传入后渲染移除按钮并回传文件名', () => {
    const onRemove = vi.fn();
    render(<FileCard name="a.pdf" onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: '移除 a.pdf' }));
    expect(onRemove).toHaveBeenCalledWith('a.pdf');
  });

  it('边界：percent 越界时钳制到 0–100', () => {
    const { container: over } = render(
      <FileCard name="a.png" status="uploading" percent={150} />,
    );
    expect(
      over
        .querySelector('[role="progressbar"]')
        ?.getAttribute('aria-valuenow'),
    ).toBe('100');

    const { container: under } = render(
      <FileCard name="a.png" status="uploading" percent={-5} />,
    );
    expect(
      under
        .querySelector('[role="progressbar"]')
        ?.getAttribute('aria-valuenow'),
    ).toBe('0');
  });

  it('边界：无 size 不渲染大小；无扩展名不渲染徽标', () => {
    const { container } = render(<FileCard name="README" />);

    expect(screen.getByText('README')).toBeDefined();
    expect(container.querySelector('.aura-x-file-card-size')).toBeNull();
    expect(container.querySelector('.aura-x-file-card-ext')).toBeNull();
  });

  it('边界：非 uploading 状态即使有 percent 也不渲染进度条', () => {
    const { container } = render(<FileCard name="a.pdf" percent={60} />);
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('单元：formatFileSize 分档正确', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1024 * 1024 * 3.5)).toBe('3.5 MB');
    expect(formatFileSize(1024 ** 3 * 2)).toBe('2.0 GB');
  });

  it('单元：getFileExt 处理边界输入', () => {
    expect(getFileExt('report.PDF')).toBe('pdf');
    expect(getFileExt('archive.tar.gz')).toBe('gz');
    expect(getFileExt('README')).toBe('');
    expect(getFileExt('.gitignore')).toBe('');
    expect(getFileExt('dir/')).toBe('');
  });

  it('a11y：默认用法无 axe 违规', async () => {
    const { container } = render(
      <FileCard
        name="a.pdf"
        size={2048}
        status="uploading"
        percent={50}
        onRemove={() => {}}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
