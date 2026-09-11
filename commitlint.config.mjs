/**
 * commitlint 配置 —— 约束提交信息格式。
 *
 * 采用 Conventional Commits（与仓库既有历史一致，例如：
 * `fix(lib): ...`、`chore(deps): ...`、`ci: ...`）。
 *
 * 由 .husky/commit-msg 钩子触发；也可手动校验：
 *   echo "fix: 修复 xxx" | pnpm commitlint
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许的提交类型（在 config-conventional 默认值基础上显式声明）
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 缺陷修复
        'perf', // 性能优化
        'refactor', // 重构（不改行为）
        'docs', // 文档
        'test', // 测试
        'build', // 构建系统 / 依赖
        'ci', // CI 配置
        'chore', // 其他杂项
        'style', // 仅格式调整
        'revert', // 回滚
      ],
    ],
    // 主题行长度：中文按字符计，放宽到 100 以免误伤
    'header-max-length': [2, 'always', 100],
    // 允许中文等非拉丁字符的主题
    'subject-case': [0],
  },
};
