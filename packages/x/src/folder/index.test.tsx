import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Folder } from './index';
import type { FolderRef, FolderTreeData } from './index';

const TREE: FolderTreeData[] = [
  {
    title: 'src',
    path: 'src',
    children: [
      { title: 'index.ts', path: 'index.ts', content: 'export const a = 1;' },
      { title: 'Bubble.tsx', path: 'Bubble.tsx', content: 'const Bubble = 1;' },
    ],
  },
  { title: 'README.md', path: 'README.md', content: '# hello' },
];

describe('Folder', () => {
  it('正常：默认展开全部文件夹，渲染目录标题与树节点', () => {
    render(<Folder treeData={TREE} directoryTitle="示例项目" />);

    expect(screen.getByText('示例项目')).toBeDefined();
    expect(screen.getByRole('tree', { name: '文件树' })).toBeDefined();
    expect(screen.getAllByRole('treeitem')).toHaveLength(4);

    const folder = screen.getByRole('treeitem', { name: 'src' });
    expect(folder.getAttribute('aria-expanded')).toBe('true');
    expect(folder.getAttribute('aria-level')).toBe('1');
    expect(
      screen.getByRole('treeitem', { name: 'index.ts' }).getAttribute('aria-level'),
    ).toBe('2');
  });

  it('正常：点击文件选中并预览内容，回调收到 path/name/content', () => {
    const onSelectedFileChange = vi.fn();
    const onFileClick = vi.fn();
    const { container } = render(
      <Folder
        treeData={TREE}
        onSelectedFileChange={onSelectedFileChange}
        onFileClick={onFileClick}
      />,
    );

    fireEvent.click(screen.getByRole('treeitem', { name: 'index.ts' }));

    expect(onSelectedFileChange).toHaveBeenCalledWith({
      path: ['src', 'index.ts'],
      name: 'index.ts',
      content: 'export const a = 1;',
    });
    expect(onFileClick).toHaveBeenCalledWith('src/index.ts', 'export const a = 1;');
    expect(screen.getByRole('treeitem', { name: 'index.ts' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    // 语法高亮会把代码切成多个 token 元素，故按容器整体文本断言
    expect(
      container.querySelector('.aura-x-folder-preview-body')?.textContent,
    ).toContain('export const a = 1;');
    // 预览区标题为文件名
    expect(screen.getByText('index.ts', { selector: '.aura-x-folder-preview-title' })).toBeDefined();
  });

  it('正常：点击文件夹展开 / 收起并触发回调', () => {
    const onExpandedPathsChange = vi.fn();
    const onFolderClick = vi.fn();
    render(
      <Folder
        treeData={TREE}
        onExpandedPathsChange={onExpandedPathsChange}
        onFolderClick={onFolderClick}
      />,
    );

    const folder = screen.getByRole('treeitem', { name: 'src' });
    fireEvent.click(folder);

    expect(onFolderClick).toHaveBeenCalledWith('src');
    expect(onExpandedPathsChange).toHaveBeenCalledWith([]);
    expect(folder.getAttribute('aria-expanded')).toBe('false');
    // 收起后子节点不再渲染
    expect(screen.queryByRole('treeitem', { name: 'index.ts' })).toBeNull();
  });

  it('正常：键盘 Enter 激活、← / → 收起展开', () => {
    render(<Folder treeData={TREE} />);

    const folder = screen.getByRole('treeitem', { name: 'src' });
    fireEvent.keyDown(folder, { key: 'ArrowLeft' });
    expect(folder.getAttribute('aria-expanded')).toBe('false');

    fireEvent.keyDown(folder, { key: 'ArrowRight' });
    expect(folder.getAttribute('aria-expanded')).toBe('true');

    fireEvent.keyDown(screen.getByRole('treeitem', { name: 'README.md' }), {
      key: 'Enter',
    });
    expect(
      screen.getByRole('treeitem', { name: 'README.md' }).getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('正常：ref 暴露不可变的 getNode / updateNode / deleteNode / addNode', () => {
    const ref = React.createRef<FolderRef>();
    render(<Folder ref={ref} treeData={TREE} />);

    expect(ref.current?.getNode(['src', 'index.ts'])?.title).toBe('index.ts');
    expect(ref.current?.getNode(['nope'])).toBeUndefined();

    const renamed = ref.current!.updateNode(['src', 'index.ts'], {
      title: 'main.ts',
    });
    expect(ref.current?.getNode(['src', 'index.ts'])?.title).toBe('index.ts');
    expect(
      renamed.find((n) => n.path === 'src')?.children?.[0].title,
    ).toBe('main.ts');

    const removed = ref.current!.deleteNode(['src', 'index.ts']);
    expect(removed.find((n) => n.path === 'src')?.children).toHaveLength(1);

    const added = ref.current!.addNode(['src'], {
      title: 'new.ts',
      path: 'new.ts',
      content: '',
    });
    expect(added.find((n) => n.path === 'src')?.children).toHaveLength(3);
  });

  it('边界：默认收起（defaultExpandAll=false）时子节点不渲染', () => {
    render(<Folder treeData={TREE} defaultExpandAll={false} />);

    expect(
      screen.getByRole('treeitem', { name: 'src' }).getAttribute('aria-expanded'),
    ).toBe('false');
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
  });

  it('边界：defaultExpandedPaths 指定展开项', () => {
    render(<Folder treeData={TREE} defaultExpandedPaths={['src']} />);

    expect(
      screen.getByRole('treeitem', { name: 'src' }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('边界：受控 selectedFile 不随点击变化，但回调仍触发', () => {
    const onSelectedFileChange = vi.fn();
    render(
      <Folder
        treeData={TREE}
        selectedFile={[]}
        onSelectedFileChange={onSelectedFileChange}
      />,
    );

    fireEvent.click(screen.getByRole('treeitem', { name: 'README.md' }));

    expect(onSelectedFileChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('treeitem', { name: 'README.md' }).getAttribute('aria-selected'),
    ).toBe('false');
  });

  it('边界：selectable=false 时点击不触发选择回调', () => {
    const onSelectedFileChange = vi.fn();
    render(
      <Folder
        treeData={TREE}
        selectable={false}
        onSelectedFileChange={onSelectedFileChange}
      />,
    );

    fireEvent.click(screen.getByRole('treeitem', { name: 'README.md' }));
    expect(onSelectedFileChange).not.toHaveBeenCalled();
  });

  it('边界：treeData 为空时展示空状态，emptyRender=false 则不展示', () => {
    const { container } = render(<Folder treeData={[]} />);
    expect(screen.getByText('暂无文件')).toBeDefined();
    expect(container.querySelector('[role="tree"]')).toBeNull();

    const { container: none } = render(<Folder treeData={[]} emptyRender={false} />);
    expect(none.textContent).not.toContain('暂无文件');

    render(<Folder treeData={[]} emptyRender="拖入文件" />);
    expect(screen.getAllByText('拖入文件').length).toBeGreaterThan(0);
  });

  it('边界：未选中时预览区展示默认占位；选中文件夹展示条目数', () => {
    render(<Folder treeData={TREE} />);
    expect(screen.getByText('请选择一个文件')).toBeDefined();

    fireEvent.click(screen.getByRole('treeitem', { name: 'src' }));
    expect(screen.getByText('文件夹 · 2 项')).toBeDefined();
  });

  it('边界：directoryTitle=false 不渲染标题，previewTitle 可自定义', () => {
    const { container } = render(
      <Folder treeData={TREE} directoryTitle={false} previewTitle="预览区" />,
    );

    expect(container.querySelector('.aura-x-folder-directory-title')).toBeNull();
    expect(screen.getByText('预览区')).toBeDefined();
  });

  it('边界：previewRender 覆盖默认预览', () => {
    render(
      <Folder
        treeData={TREE}
        defaultSelectedFile={['README.md']}
        previewRender={(file, info) => (
          <div>
            <span>自定义：{file.language}</span>
            {info.originNode}
          </div>
        )}
      />,
    );

    expect(screen.getByText('自定义：markdown')).toBeDefined();
  });

  it('边界：directoryIcons 按目录与扩展名匹配，false 时不渲染图标', () => {
    const { container: custom } = render(
      <Folder
        treeData={TREE}
        directoryIcons={{ directory: '📁', tsx: '⚛️' }}
      />,
    );
    expect(custom.textContent).toContain('📁');
    expect(custom.textContent).toContain('⚛️');

    const { container: none } = render(<Folder treeData={TREE} directoryIcons={false} />);
    expect(none.querySelector('.aura-x-folder-node-icon svg')).toBeNull();
  });

  it('异常：右键触发 onRightClick，并挂载自定义菜单', async () => {
    const onRightClick = vi.fn();
    render(
      <Folder
        treeData={TREE}
        onRightClick={onRightClick}
        contextMenu={[{ key: 'rename', label: '重命名' }]}
      />,
    );

    fireEvent.contextMenu(screen.getByRole('treeitem', { name: 'README.md' }));

    expect(onRightClick).toHaveBeenCalledTimes(1);
    expect(onRightClick.mock.calls[0][0].node.title).toBe('README.md');
    expect(await screen.findByText('重命名')).toBeDefined();
  });

  it('异常：fileContentService 加载中显示 loading，完成后展示内容', async () => {
    let resolveIt: (value: string) => void = () => {};
    const service = {
      loadFileContent: vi.fn(
        () => new Promise<string>((resolve) => {
          resolveIt = resolve;
        }),
      ),
    };
    const { container } = render(
      <Folder
        treeData={[{ title: 'a.ts', path: 'a.ts' }]}
        defaultSelectedFile={['a.ts']}
        fileContentService={service}
      />,
    );

    expect(container.querySelector('.aura-x-folder-loading')).not.toBeNull();
    expect(service.loadFileContent).toHaveBeenCalledWith('a.ts');

    resolveIt('const fromService = true;');
    await waitFor(() => {
      expect(
        container.querySelector('.aura-x-folder-preview-body')?.textContent,
      ).toContain('const fromService = true;');
    });
  });

  it('异常：fileContentService 失败时展示错误，不白屏', async () => {
    const service = {
      loadFileContent: vi.fn(() => Promise.reject(new Error('读取失败：404'))),
    };
    render(
      <Folder
        treeData={[{ title: 'a.ts', path: 'a.ts' }]}
        defaultSelectedFile={['a.ts']}
        fileContentService={service}
      />,
    );

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('读取失败：404');
  });

  it('a11y：常规用法无 axe 违规', async () => {
    const { container } = render(
      <Folder treeData={TREE} defaultSelectedFile={['src', 'index.ts']} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
