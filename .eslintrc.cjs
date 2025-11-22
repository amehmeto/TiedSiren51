// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  extends: ['expo', 'prettier', 'plugin:no-switch-statements/recommended'],
  plugins: [
    'prettier',
    'no-switch-statements',
    'react',
    'react-hooks',
    'react-native',
    'sonarjs',
    'local-rules',
  ],
  rules: {
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // Node built-in modules
          'external', // npm packages
          'internal', // Your path aliases (@core, @ui, etc.)
          'parent', // ../
          'sibling', // ./
          'index', // ./index
        ],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'object-shorthand': ['error', 'always'],
    'lines-between-class-members': ['error', 'always'],
    'max-statements-per-line': ['error', { max: 1 }],
    'no-console': 'error',
    'no-else-return': 'warn',
    'no-nested-ternary': 'error',
    'no-switch-statements/no-switch': 'error',
    'prefer-const': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-collection-size-mischeck': 'error',
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-gratuitous-expressions': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-redundant-jump': 'error',
    'sonarjs/no-same-line-conditional': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/prefer-object-literal': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',
    'prettier/prettier': 'error',
    complexity: ['warn', { max: 10 }],
    curly: ['error', 'multi-or-nest'],
    eqeqeq: ['error', 'always'],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'block-like', next: 'block-like' },
    ],
    // React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    // React Native rules
    'react-native/no-color-literals': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-raw-text': 'error',
    'react-native/no-single-element-style-arrays': 'error',
    'react-native/no-unused-styles': 'error',
    // Custom local rules
    'local-rules/no-stylesheet-magic-numbers': 'error',
    'local-rules/no-complex-jsx-in-conditionals': [
      'error',
      {
        maxProps: 2,
        allowSimpleElements: true,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          {
            assertionStyle: 'never',
          },
        ],
      },
    },
    {
      files: ['scripts/**/*.{js,cjs}', 'electron.js'],
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
