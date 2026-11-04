import React from 'react';
import { Editor } from '@aura-react-comp/editor';

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        评论框：只保留最必要的几个能力
      </div>
      <Editor
        height={140}
        minHeight={120}
        placeholder="说点什么…"
        features={{
          heading: false,
          highlight: false,
          fontSize: false,
          subscript: false,
          superscript: false,
          align: false,
          taskList: false,
          table: false,
          image: false,
          codeBlock: false,
          horizontalRule: false,
          characterCount: false,
        }}
        defaultValue="<p>这个方案我同意，<strong>排期</strong>上需要再确认一下。</p>"
      />
    </div>

    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        英文界面（locale=&quot;en-US&quot;）
      </div>
      <Editor
        height={160}
        locale="en-US"
        defaultValue="<p>Toolbar labels follow the locale prop.</p>"
      />
    </div>
  </div>
);

export default Demo;
