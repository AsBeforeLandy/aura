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

  // 组件库源码
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
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

      // 未使用变量：允许以 _ 开头显式忽略
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
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
