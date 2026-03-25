// ESLint is JSON-only. All JS/TS linting is handled by OxLint.
// See .oxlintrc.json for the full rule set.

import eslintPluginJsonc from 'eslint-plugin-jsonc'
import localRules from 'eslint-plugin-local-rules'

export default [
  {
    ignores: [
      'node_modules/**',
      '.worktrees/**',
      'android/**',
      'ios/**',
      'coverage/**',
      '**/coverage/**',
      'dist/**',
      '.expo/**',
    ],
  },

  ...eslintPluginJsonc.configs['flat/recommended-with-json'],

  // JSON files
  {
    files: ['**/*.json'],
    ignores: [
      'tsconfig.json',
      'tsconfig.*.json',
      '.claude/settings.local.json',
    ],
    rules: {
      'jsonc/indent': ['error', 2],
      'jsonc/key-spacing': 'error',
      'jsonc/sort-keys': 'off',
    },
  },

  // package.json — enforce @amehmeto/ deps pinned to commit hash
  {
    files: ['package.json'],
    plugins: {
      'local-rules': localRules,
    },
    rules: {
      'local-rules/require-amehmeto-pinning': 'error',
    },
  },

  // Claude settings — sorted permission arrays
  {
    files: ['.claude/settings.local.json', '.claude/settings.json'],
    rules: {
      'jsonc/indent': ['error', 2],
      'jsonc/key-spacing': 'error',
      'jsonc/sort-array-values': [
        'error',
        {
          pathPattern: String.raw`^permissions\.(allow|deny|ask)$`,
          order: { type: 'asc' },
        },
      ],
    },
  },

  // tsconfig files (JSONC — allows comments)
  {
    files: ['tsconfig.json', 'tsconfig.*.json'],
    rules: {
      'jsonc/indent': ['error', 2],
      'jsonc/key-spacing': 'error',
      'jsonc/no-comments': 'off',
      'jsonc/sort-keys': 'off',
    },
  },
]
