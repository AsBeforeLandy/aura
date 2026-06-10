import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Upload } from './index';

const UploadComponent = Upload as unknown as React.FC<any> & { Dragger: any };

if (typeof window !== 'undefined' && !window.URL.createObjectURL) {
  window.URL.createObjectURL = () => 'mock-url';
  window.URL.revokeObjectURL = () => {};
}

describe('Upload', () => {
  it('应该正确渲染上传组件', () => {
    const { container } = render(<UploadComponent />);
    expect(container.querySelector('.aura-upload')).toBeDefined();
    expect(screen.getByText('点击上传')).toBeDefined();
  });

  it('点击触发按钮应打开文件选择', () => {
    const { container } = render(<UploadComponent />);
    const trigger = container.querySelector('.aura-upload-trigger') as HTMLButtonElement;
    const input = container.querySelector('.aura-upload-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.click(trigger);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('应该展示文件列表', async () => {
    const { container } = render(<UploadComponent />);
    const input = container.querySelector('.aura-upload-input') as HTMLInputElement;

    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeDefined();
    });
  });

  it('应该能删除文件', async () => {
    const { container } = render(<UploadComponent />);
    const input = container.querySelector('.aura-upload-input') as HTMLInputElement;

    const file = new File(['hello'], 'remove-me.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('remove-me.txt')).toBeDefined();
    });

    // hover 文件项使删除按钮可见
    const fileItem = container.querySelector('.aura-upload-file') as HTMLElement;
    const removeBtn = fileItem.querySelector('.aura-upload-file-remove') as HTMLButtonElement;
    fireEvent.click(removeBtn);

    expect(screen.queryByText('remove-me.txt')).toBeNull();
  });

  it('disabled 状态下不可点击', () => {
    const { container } = render(<UploadComponent disabled />);
    const wrapper = container.querySelector('.aura-upload') as HTMLElement;
    expect(wrapper.classList.contains('aura-upload-disabled')).toBe(true);

    const trigger = container.querySelector('.aura-upload-trigger') as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });

  it('应该支持 listType 切换', () => {
    const { container, unmount } = render(<UploadComponent listType="picture-card" />);
    const wrapper = container.querySelector('.aura-upload') as HTMLElement;
    expect(wrapper.classList.contains('aura-upload-picture-card')).toBe(true);
    unmount();

    const { container: c2 } = render(<UploadComponent listType="picture" />);
    const wrapper2 = c2.querySelector('.aura-upload') as HTMLElement;
    expect(wrapper2.classList.contains('aura-upload-picture')).toBe(true);
  });

  it('应该触发 onChange 回调', async () => {
    const onChange = vi.fn();
    const { container } = render(<UploadComponent onChange={onChange} />);
    const input = container.querySelector('.aura-upload-input') as HTMLInputElement;

    const file = new File(['hello'], 'callback.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0][0].length).toBeGreaterThan(0);
    });
  });

  it('应该支持 Dragger 子组件', () => {
    const { container } = render(<UploadComponent.Dragger />);
    expect(container.querySelector('.aura-upload-dragger')).toBeDefined();
    expect(screen.getByText('将文件拖拽到此区域上传')).toBeDefined();
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <UploadComponent className="custom-upload" style={{ marginTop: 20 }} />,
    );
    const wrapper = container.querySelector('.aura-upload') as HTMLElement;
    expect(wrapper.classList.contains('custom-upload')).toBe(true);
    expect((wrapper as HTMLElement).style.marginTop).toBe('20px');
  });
});
