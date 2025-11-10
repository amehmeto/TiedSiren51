// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  extends: ['expo', 'prettier', 'plugin:no-switch-statements/recommended'],
  plugins: ['prettier', 'no-switch-statements'],
  rules: {
    'lines-between-class-members': ['error', 'always'],
    'max-statements-per-line': ['error', { max: 1 }],
    'no-console': 'error',
    'no-else-return': 'warn',
    'no-nested-ternary': 'error',
    'no-switch-statements/no-switch': 'error',
    'prefer-const': 'error',
    'prettier/prettier': 'error',
    complexity: ['warn', { max: 10 }],
    curly: ['error', 'multi-or-nest'],
    eqeqeq: ['error', 'always'],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'block-like', next: 'block-like' },
    ],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/prefer-optional-chain': 'error',
      },
    },
    {
      files: ['scripts/**/*.{js,cjs}'],
      env: {
        node: true,
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      plugins: ['vitest'],
      rules: {
        'vitest/no-commented-out-tests': 'error',
        'vitest/no-conditional-expect': 'error',
        'vitest/no-conditional-in-test': 'error',
        'vitest/no-disabled-tests': 'error',
        'vitest/no-focused-tests': 'error',
        'vitest/no-identical-title': 'error',
        'vitest/prefer-each': 'error',
        'vitest/prefer-hooks-in-order': 'error',
        'vitest/prefer-hooks-on-top': 'error',
      },
    },
  ],
}
