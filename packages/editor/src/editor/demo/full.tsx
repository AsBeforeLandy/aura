import React from 'react';
import { Editor } from '@aura-react-comp/editor';

const Demo: React.FC = () => (
  <Editor
    height={360}
    defaultValue={`
<h1>支持的块级元素</h1>
<p>段落里可以有 <strong>加粗</strong>、<em>斜体</em>、<u>下划线</u>、<s>删除线</s>、<code>行内代码</code>、
<mark>高亮</mark>、H<sub>2</sub>O 与 x<sup>2</sup>。</p>
<h2>列表</h2>
<ul>
  <li>无序列表项</li>
  <li>第二项
    <ul><li>嵌套一级</li></ul>
  </li>
</ul>
<ul data-type="taskList">
  <li data-checked="true"><label><input type="checkbox" checked></label><div><p>已完成的任务</p></div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div><p>待办的任务</p></div></li>
</ul>
<h2>代码块</h2>
<pre><code class="language-ts">const chart = new Chart({ type: 'line' });</code></pre>
<h2>表格</h2>
<table>
  <tbody>
    <tr><th><p>阶段</p></th><th><p>产出</p></th></tr>
    <tr><td><p>P0</p></td><td><p>内核 + 6 图表</p></td></tr>
    <tr><td><p>P1</p></td><td><p>双轴与关系图</p></td></tr>
  </tbody>
</table>
<hr>
<p>分割线以上为全部块级能力。<a href="https://example.com">链接</a>同样支持。</p>
`}
  />
);

export default Demo;
