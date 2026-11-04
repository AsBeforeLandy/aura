import React, { useState } from 'react';
import { Editor } from '@aura-react-comp/editor';

const INITIAL = `
<h2>Aura 富文本编辑器</h2>
<p>这是一段<strong>加粗</strong>、<em>斜体</em>与<code>行内代码</code>混排的示例文本，用来验证基础排版是否符合预期。</p>
<ul>
  <li>支持<strong>有序</strong>与无序列表</li>
  <li>支持任务列表、引用块与代码块</li>
  <li>支持表格与图片插入</li>
</ul>
<blockquote>编辑器外观完全由 Aura 设计令牌驱动，切换暗色主题无需额外配置。</blockquote>
`;

const Demo: React.FC = () => {
  const [html, setHtml] = useState(INITIAL);
  return (
    <Editor
      value={html}
      onChange={(next) => setHtml(next)}
      height={320}
      placeholder="开始输入内容…"
    />
  );
};

export default Demo;
