# ESLint Setup

## Base Configuration (.eslintrc.cjs)

### Core Plugins (Reusable)

```javascript
module.exports = {
  extends: [
    'prettier',
    'plugin:no-switch-statements/recommended',
    'plugin:jsonc/recommended-with-json',
  ],
  plugins: [
    'prettier',
    'no-switch-statements',
    'sonarjs',
    'unicorn',
    'jsonc',
  ],
  rules: {
    // Import ordering
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // Code style
    'object-shorthand': ['error', 'always'],
    'lines-between-class-members': ['error', 'always'],
    'max-statements-per-line': ['error', { max: 1 }],
    'no-console': 'error',
    'no-else-return': 'warn',
    'no-nested-ternary': 'error',
    'prefer-const': 'error',

    // SonarJS quality rules
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',

    // Unicorn best practices
    'unicorn/prefer-ternary': 'error',

    // Formatting
    'prettier/prettier': 'error',
    complexity: ['warn', { max: 10 }],
    curly: ['error', 'multi-or-nest'],
    eqeqeq: ['error', 'always'],
  },
}
```

### TypeScript-Specific Rules

```javascript
overrides: [
  {
    files: ['**/*.{ts,tsx}'],
    parserOptions: {
      project: './tsconfig.json',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      // No I-prefix for interfaces
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
      ],
    },
  },
]
```

### Test File Rules

```javascript
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
    'vitest/prefer-strict-equal': 'error',
  },
}
```

## Custom ESLint Rules

### Reusable Custom Rules

Located in `eslint-plugin-local-rules/` and `eslint-rules/`:

| Rule | Purpose | Reusability |
|------|---------|-------------|
| `core-test-file-naming` | Enforce test file naming patterns | High |
| `expect-separate-act-assert` | Enforce AAA test structure | High |
| `time-constant-multiplication` | Prevent magic numbers in time calculations | High |
| `try-catch-isolation` | Enforce focused error handling | High |
| `no-complex-jsx-in-conditionals` | Limit JSX complexity | Medium |
| `one-selector-per-file` | Redux selector organization | Medium |
| `one-usecase-per-file` | Use case organization | Medium |
| `require-colocated-test` | Enforce tests next to source | Medium |
| `use-data-builders` | Enforce test data builder pattern | Medium |

### Setting Up Local Rules

1. Create `eslint-plugin-local-rules/index.cjs`:

```javascript
module.exports = {
  rules: {
    'rule-name': require('../eslint-rules/rule-name.cjs'),
  },
}
```

2. Add to `package.json`:

```json
{
  "devDependencies": {
    "eslint-plugin-local-rules": "file:eslint-plugin-local-rules"
  }
}
```

3. Use in `.eslintrc.cjs`:

```javascript
{
  plugins: ['local-rules'],
  rules: {
    'local-rules/rule-name': 'error',
  }
}
```

## Clean Architecture Rules

Enforce dependency direction with restricted globals/imports:

```javascript
// In core/ files, prevent non-deterministic operations
{
  files: ['core/**/*.ts'],
  excludedFiles: ['**/*.test.ts'],
  rules: {
    'no-restricted-globals': [
      'error',
      { name: 'Date', message: 'Use DateProvider dependency' },
      { name: 'fetch', message: 'Use Gateway/Repository dependency' },
      { name: 'localStorage', message: 'Use Repository dependency' },
    ],
    'no-restricted-properties': [
      'error',
      { object: 'Math', property: 'random', message: 'Use RandomProvider' },
    ],
  },
}
```

## Required Dependencies

```bash
npm install -D \
  eslint \
  eslint-config-prettier \
  eslint-plugin-import \
  eslint-plugin-jsonc \
  eslint-plugin-no-switch-statements \
  eslint-plugin-prettier \
  eslint-plugin-sonarjs \
  eslint-plugin-unicorn \
  eslint-plugin-vitest \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser
```
