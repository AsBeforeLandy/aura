import React from 'react';
import { Editor } from '@aura-react-comp/editor';

const CONTENT = `
<h3>只读模式</h3>
<p><code>readOnly</code> 会关闭 <code>contenteditable</code> 并移除工具栏，但保留完整的排版渲染。</p>
<p>适合「详情页展示 / 编辑页修改」的双态场景，不必为展示再写一套渲染逻辑。</p>
`;

const Demo: React.FC = () => (
  <Editor readOnly height={200} toolbar="none" defaultValue={CONTENT} />
);

export default Demo;
