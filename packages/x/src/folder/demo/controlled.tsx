import React, { useMemo, useState } from 'react';
import { Folder } from '@aura-react-comp/x';
import type { FileContentService, FolderTreeData } from '@aura-react-comp/x';

const TREE: FolderTreeData[] = [
  {
    title: 'skills',
    path: 'skills',
    children: [
      { title: 'SKILL.md', path: 'SKILL.md' },
      {
        title: 'reference',
        path: 'reference',
        children: [
          { title: 'API.md', path: 'API.md' },
          { title: 'EXAMPLES.md', path: 'EXAMPLES.md' },
        ],
      },
    ],
  },
  { title: 'package.json', path: 'package.json' },
];

/** 模拟远端按需读取：内容不存在于 treeData 里 */
const service: FileContentService = {
  loadFileContent: (filePath) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(`// ${filePath}\n// 内容来自 fileContentService（异步拉取）`);
      }, 300);
    }),
};

export default () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['skills']);

  const icons = useMemo(
    () => ({
      directory: '📁',
      md: '📄',
      json: '🧾',
    }),
    [],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
      <Folder
        treeData={TREE}
        selectedFile={selected}
        onSelectedFileChange={(file) => setSelected(file.path)}
        expandedPaths={expanded}
        onExpandedPathsChange={setExpanded}
        fileContentService={service}
        directoryTitle="技能目录"
        directoryIcons={icons}
      />
      <p
        style={{
          margin: 0,
          fontSize: 'var(--aura-font-size-xs)',
          color: 'var(--aura-text-secondary)',
        }}
      >
        当前选中：{selected.length ? selected.join('/') : '（无）'}
      </p>
    </div>
  );
};
