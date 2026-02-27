// ESLint is now JSON-only. All JS/TS linting is handled by OxLint.
// See .oxlintrc.json for the full rule set.

module.exports = {
  root: true,
  ignorePatterns: ['node_modules', '!.claude'],
  plugins: ['jsonc'],
  overrides: [
    // JSON files linting
    {
      files: ['*.json', '**/*.json'],
      excludedFiles: [
        'tsconfig.json',
        'tsconfig.*.json',
        '.claude/settings.local.json',
      ],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/indent': ['error', 2],
        'jsonc/key-spacing': 'error',
        'jsonc/no-dupe-keys': 'error',
        'jsonc/sort-keys': 'off',
      },
    },
    // Claude settings - enforce sorted arrays for permissions
    {
      files: ['.claude/settings.local.json', '.claude/settings.json'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/indent': ['error', 2],
        'jsonc/key-spacing': 'error',
        'jsonc/no-dupe-keys': 'error',
        'jsonc/sort-array-values': [
          'error',
          {
            pathPattern: '^permissions\\.(allow|deny|ask)$',
            order: { type: 'asc' },
          },
        ],
      },
    },
    // JSONC files (tsconfig allows comments)
    {
      files: ['tsconfig.json', 'tsconfig.*.json'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/indent': ['error', 2],
        'jsonc/key-spacing': 'error',
        'jsonc/no-dupe-keys': 'error',
        'jsonc/no-comments': 'off',
        'jsonc/sort-keys': 'off',
      },
    },
  ],
}
