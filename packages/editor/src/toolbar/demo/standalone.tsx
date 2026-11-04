import React, { useState } from 'react';
import { Editor, Toolbar, resolveFeatures } from '@aura-react-comp/editor';
import type { Editor as TiptapEditor } from '@tiptap/react';

/**
 * 把工具栏拿出来单独摆：用于「工具栏在页面顶部、编辑区在下方」的布局，
 * 或者需要在工具栏里插入自己的按钮时。
 */
const Demo: React.FC = () => {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  return (
    <div
      style={{
        border: '1px solid var(--aura-border, #e5e7eb)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--aura-border, #e5e7eb)',
          background: 'var(--aura-bg-secondary, #f9fafb)',
        }}
      >
        {editor ? (
          <Toolbar
            editor={editor}
            features={resolveFeatures()}
            locale="zh-CN"
          />
        ) : (
          <div
            style={{
              padding: 10,
              fontSize: 12,
              color: 'var(--aura-text-tertiary)',
            }}
          >
            编辑器加载中…
          </div>
        )}
      </div>
      <Editor
        toolbar="none"
        height={220}
        defaultValue="<p>工具栏被移动到容器顶部，编辑区独立渲染。</p>"
        onReady={(instance) => setEditor(instance as TiptapEditor)}
      />
    </div>
  );
};

export default Demo;
