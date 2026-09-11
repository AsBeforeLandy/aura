import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/esm/**',
      '**/lib/**',
      '**/dist/**',
      '.dumi/**',
      '.workbuddy/**',
      '.worktrees/**',
      'coverage/**',
    ],
  },

  // 组件库源码与测试：统一使用 TypeScript 解析器。
  // 注意 files 需覆盖 tests/ 等非 packages 目录，否则这些文件会退回默认
  // 解析器（espree）并在 TS 语法处直接解析失败。
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // Hooks 规则：组件库正确性的基本盘
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // 类型安全：允许知情妥协，但必须显式标注
      '@typescript-eslint/no-explicit-any': 'warn',

      // 未使用变量：
      // - `^_` 前缀表示「显式声明为不使用」
      // - ignoreRestSiblings 覆盖「解构出来只为把它排除出 ...rest」这一常见模式，
      //   例如 Upload 解构 action / headers 后不再往下传。若把这些变量删掉，
      //   它们会重新进入 ...rest 并被 spread 到 DOM 上，属于行为回归。
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // 组件库不应向控制台输出
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 测试文件：放宽
  {
    files: ['packages/*/src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // 文档示例（demo）：面向阅读而非生产，放宽易产生噪音的规则
  {
    files: ['packages/*/src/**/demo/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
    },
  },

  // CLI 工具：向终端输出是其正常职能
  {
    files: ['packages/cli/src/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // Prettier 放最后：关闭所有与格式化冲突的规则
  prettierConfig,
];
