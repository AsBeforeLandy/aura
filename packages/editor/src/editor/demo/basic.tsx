import React, { useState } from 'react';
import { Editor } from '@aura-react-comp/editor';

const INITIAL = `
<h2>产品需求评审纪要</h2>
<p>参会人：产品、设计、前端、后端。本次评审聚焦<strong>数据看板</strong>的第二期范围。</p>
<h3>结论</h3>
<ol>
  <li>本期先交付 6 张基础图表与编辑器</li>
  <li>双轴、地图、协同编辑顺延到下一期</li>
</ol>
<blockquote>设计稿本周五前定稿，前端下周一进入开发。</blockquote>
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
