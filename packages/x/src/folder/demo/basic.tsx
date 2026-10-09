import React from 'react';
import { Folder } from '@aura-react-comp/x';
import type { FolderTreeData } from '@aura-react-comp/x';

const TREE: FolderTreeData[] = [
  {
    title: 'src',
    path: 'src',
    children: [
      {
        title: 'components',
        path: 'components',
        children: [
          {
            title: 'Bubble.tsx',
            path: 'Bubble.tsx',
            content: `export const Bubble = () => <div className="bubble" />;`,
          },
          {
            title: 'Sender.tsx',
            path: 'Sender.tsx',
            content: `export const Sender = () => <textarea aria-label="消息输入框" />;`,
          },
        ],
      },
      {
        title: 'index.ts',
        path: 'index.ts',
        content: `export * from './components/Bubble';\nexport * from './components/Sender';`,
      },
    ],
  },
  {
    title: 'README.md',
    path: 'README.md',
    content: `# 示例项目\n\n点击左侧文件查看内容。`,
  },
  { title: 'LICENSE', path: 'LICENSE', content: 'MIT' },
];

export default () => (
  <div style={{ maxWidth: 720 }}>
    <Folder treeData={TREE} directoryTitle="示例项目" />
  </div>
);
