import React from 'react';
import { ThoughtChain } from '@aura-react-comp/x';
import type { ThoughtChainItem } from '@aura-react-comp/x';

/** 检索 → 分析 → 生成：全部成功的完整链路 */
const DONE_CHAIN: ThoughtChainItem[] = [
  {
    key: 'retrieve',
    title: '检索知识库',
    description: '命中 3 篇文档：Aura 主题定制、令牌规范、发布流程',
    status: 'success',
  },
  {
    key: 'analyze',
    title: '比对令牌定义',
    description: '发现 fontWeight 与 fontSize 两处命名不一致',
    status: 'success',
  },
  {
    key: 'generate',
    title: '生成修复建议',
    description: '输出 2 个文件的最小改动补丁',
    status: 'success',
  },
];

/** 含失败步骤与待办步骤的链路：展示四态节点混排 */
const MIXED_CHAIN: ThoughtChainItem[] = [
  { key: 'plan', title: '拆解任务', status: 'success', description: '共 4 个子任务' },
  { key: 'fetch', title: '拉取远端仓库', status: 'error', description: '网络超时，已重试 2 次' },
  { key: 'retry', title: '改用本地缓存继续', status: 'thinking' },
  { key: 'report', title: '汇总报告', status: 'pending' },
];

export default () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 560,
    }}
  >
    <ThoughtChain items={MIXED_CHAIN} defaultExpanded />
    <ThoughtChain items={DONE_CHAIN} title="完成链路" collapsible={false} />
  </div>
);
