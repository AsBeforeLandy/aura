import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Upload } from './index';
import { requestUpload } from './request';

// 真实上传走 XHR，单测中 mock 掉网络层，只断言参数与状态流转
vi.mock('./request', () => ({ requestUpload: vi.fn() }));
const mockedRequestUpload = vi.mocked(requestUpload);

const makeFile = () => new File(['hello'], 'hello.txt', { type: 'text/plain' });

/** 模拟用户通过文件选择框选文件 */
function selectFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]')!;
  Object.defineProperty(input, 'files', { value: [makeFile()] });
  fireEvent.change(input);
}

const okResponse = { status: 200 } as XMLHttpRequest;
const failResponse = { status: 500 } as XMLHttpRequest;

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

describe('真实上传（配置 action / headers）', () => {
  beforeEach(() => {
    mockedRequestUpload.mockReset();
  });

  it('配置 action 后选择文件会发起上传请求，成功后置为 done', async () => {
    mockedRequestUpload.mockResolvedValueOnce(okResponse);
    const { container } = render(<Upload action="/api/upload" />);
    selectFile(container);

    expect(mockedRequestUpload).toHaveBeenCalledTimes(1);
    const arg = mockedRequestUpload.mock.calls[0][0];
    expect(arg.action).toBe('/api/upload');
    expect(arg.file).toBeInstanceOf(File);
    expect(arg.file.name).toBe('hello.txt');

    await waitFor(() => {
      const item = container.querySelector('.aura-upload-file')!;
      expect(item.classList.contains('aura-upload-file-done')).toBe(true);
    });
  });

  it('上传失败（非 2xx）时状态置为 error', async () => {
    mockedRequestUpload.mockRejectedValueOnce(failResponse);
    const { container } = render(<Upload action="/api/upload" />);
    selectFile(container);

    await waitFor(() => {
      const item = container.querySelector('.aura-upload-file')!;
      expect(item.classList.contains('aura-upload-file-error')).toBe(true);
    });
  });

  it('headers 会随请求原样透传', () => {
    mockedRequestUpload.mockResolvedValueOnce(okResponse);
    const { container } = render(
      <Upload action="/api/upload" headers={{ 'X-Token': 'abc' }} />,
    );
    selectFile(container);

    expect(mockedRequestUpload.mock.calls[0][0].headers).toEqual({
      'X-Token': 'abc',
    });
  });

  it('beforeUpload 返回 false 时不发起上传请求', () => {
    const { container } = render(
      <Upload action="/api/upload" beforeUpload={() => false} />,
    );
    selectFile(container);

    expect(mockedRequestUpload).not.toHaveBeenCalled();
    expect(container.querySelector('.aura-upload-file')).toBeNull();
  });

  it('未配置 action 时保持本地模拟流程，不发真实请求', () => {
    const { container } = render(<Upload />);
    selectFile(container);

    expect(mockedRequestUpload).not.toHaveBeenCalled();
    // 文件已进入列表且处于上传中
    const item = container.querySelector('.aura-upload-file')!;
    expect(item.classList.contains('aura-upload-file-uploading')).toBe(true);
  });

  it('Dragger 同样支持 action 真实上传', () => {
    mockedRequestUpload.mockResolvedValueOnce(okResponse);
    const { container } = render(<UploadComponent.Dragger action="/api/upload" />);
    selectFile(container);

    expect(mockedRequestUpload).toHaveBeenCalledTimes(1);
    expect(mockedRequestUpload.mock.calls[0][0].action).toBe('/api/upload');
  });
});

describe('Dragger 自定义内容', () => {
  it('children 应替换默认拖拽区内容', () => {
    const { container } = render(
      <UploadComponent.Dragger>
        <div>自定义拖拽区内容</div>
      </UploadComponent.Dragger>,
    );
    expect(screen.getByText('自定义拖拽区内容')).toBeDefined();
    expect(screen.queryByText('将文件拖拽到此区域上传')).toBeNull();
  });

  it('未传 children 时保持默认拖拽区内容', () => {
    render(<UploadComponent.Dragger />);
    expect(screen.getByText('将文件拖拽到此区域上传')).toBeDefined();
  });
});
