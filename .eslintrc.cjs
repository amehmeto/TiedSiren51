// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  extends: ['expo', 'prettier', 'plugin:no-switch-statements/recommended'],
  plugins: ['prettier', 'no-switch-statements'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error',
    'no-switch-statements/no-switch': 'error',
    'lines-between-class-members': ['error', 'always'],
    'no-else-return': 'warn',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'block-like', next: 'block-like' }
    ],
  },
  overrides: [
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