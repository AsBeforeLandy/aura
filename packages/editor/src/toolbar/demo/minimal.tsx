import React, { useState } from 'react';
import { Editor, Toolbar, resolveFeatures } from '@aura-react-comp/editor';
import type { Editor as TiptapEditor } from '@tiptap/react';

/** 只保留行内样式与列表的工具条 —— 用于「轻量输入框 + 完整能力隐藏」的场景 */
const LIGHT_FEATURES = resolveFeatures({
  heading: false,
  color: false,
  fontSize: false,
  highlight: false,
  align: false,
  table: false,
  image: false,
  codeBlock: false,
  horizontalRule: false,
  subscript: false,
  superscript: false,
  taskList: false,
});

const Demo: React.FC = () => {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        features 传入 resolveFeatures 的结果，工具栏自动精简
      </div>
      {editor ? (
        <Toolbar editor={editor} features={LIGHT_FEATURES} locale="zh-CN" />
      ) : null}
      <Editor
        toolbar="none"
        height={180}
        features={{
          heading: false,
          color: false,
          fontSize: false,
          highlight: false,
          align: false,
          table: false,
          image: false,
          codeBlock: false,
          horizontalRule: false,
          subscript: false,
          superscript: false,
          taskList: false,
        }}
        onReady={(instance) => setEditor(instance as TiptapEditor)}
        defaultValue="<p>精简后的工具栏只剩<strong>加粗</strong>、<em>斜体</em>、列表与撤销重做。</p>"
      />
    </div>
  );
};

export default Demo;
