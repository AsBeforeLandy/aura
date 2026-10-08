import React, { useState } from 'react';
import { Input, Space } from '@aura/ui';

/** addonBefore / addonAfter 渲染在边框外；showCount 展示字数；onPressEnter 响应回车。 */
export default () => {
  const [url, setUrl] = useState('example');
  const [submitted, setSubmitted] = useState('');

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input addonBefore="https://" addonAfter=".com" defaultValue="example" />
      <Input
        showCount
        maxLength={20}
        placeholder="最多 20 字，实时统计"
      />
      <Input
        showCount={{ formatter: ({ count }) => `${count} 字` }}
        placeholder="自定义统计文案"
      />
      <div>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPressEnter={() => setSubmitted(url)}
          placeholder="输入后按回车提交"
        />
        {submitted && <p style={{ margin: '8px 0 0' }}>已提交：{submitted}</p>}
      </div>
    </Space>
  );
};
