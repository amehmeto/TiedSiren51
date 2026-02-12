// https://docs.expo.dev/guides/using-eslint/
//
// This is the ESLint-only config. Most rules (including 50+ custom rules) run
// in OxLint for speed — see .oxlintrc.json. ESLint handles rules that OxLint
// cannot: sonarjs, react-native, jsonc, naming-convention, curly multi-or-nest,
// import/order, and rules needing excludedFiles override scoping.
//
// eslint-plugin-oxlint/recommended disables ESLint rules that OxLint handles,
// preventing double-reporting. The plugin version should match oxlint version.
//
// OxLint uses jest/* rules which also understand vitest syntax.
// unicorn/no-nested-ternary is off in OxLint (auto-fix conflicts with Prettier).
module.exports = {
  ignorePatterns: ['node_modules', '!.claude', 'eslint-rules/', 'oxlint-plugin-local-rules.js'],
  extends: [
    'expo',
    'prettier',
    'plugin:no-switch-statements/recommended',
    'plugin:jsonc/recommended-with-json',
    'plugin:oxlint/recommended',
  ],
  plugins: [
    'prettier',
    'no-switch-statements',
    'react',
    'react-hooks',
    'react-native',
    'sonarjs',
    'unicorn',
    'local-rules',
    'jsonc',
    'oxlint',
  ],
  rules: {
    // Rules kept in ESLint due to OxLint override scoping bugs
    'local-rules/no-nested-call-expressions': 'off',
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
    'no-switch-statements/no-switch': 'error',
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
    'unicorn/prefer-ternary': 'error',
    'prettier/prettier': 'error',
    curly: ['error', 'multi-or-nest'],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'block-like', next: 'block-like' },
    ],
    // React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    // React Native rules
    'react-native/no-color-literals': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-raw-text': 'error',
    'react-native/no-single-element-style-arrays': 'error',
    'react-native/no-unused-styles': 'error',
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          {
            assertionStyle: 'never',
          },
        ],
        // Enforce no I-prefix for interfaces (TypeScript convention)
        // See: docs/adr/core/port-naming-convention.md
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
          // Enforce boolean naming convention (is, has, should, can, did, will, was)
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          },
          {
            selector: 'parameter',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          },
          {
            selector: 'classProperty',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
            leadingUnderscore: 'allow',
          },
        ],
      },
    },
    {
      files: ['scripts/**/*.{js,cjs,mjs}', 'electron.js'],
      env: {
        node: true,
      },
    },
    // No non-deterministic globals/imports in core (OxLint overrides don't scope correctly)
    {
      files: ['core/**/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-restricted-globals': [
          'error',
          {
            name: 'Date',
            message:
              'Non-deterministic: Use DateProvider dependency instead of Date in core.',
          },
          {
            name: 'performance',
            message:
              'Non-deterministic: Use DateProvider dependency instead of performance in core.',
          },
          {
            name: 'setTimeout',
            message:
              'Non-deterministic: Use TimerProvider dependency instead of setTimeout in core.',
          },
          {
            name: 'setInterval',
            message:
              'Non-deterministic: Use TimerProvider dependency instead of setInterval in core.',
          },
          {
            name: 'crypto',
            message:
              'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
          },
          {
            name: 'fetch',
            message:
              'Non-deterministic: Use a Repository/Gateway dependency instead of fetch in core.',
          },
          {
            name: 'XMLHttpRequest',
            message:
              'Non-deterministic: Use a Repository/Gateway dependency instead of XMLHttpRequest in core.',
          },
          {
            name: 'localStorage',
            message:
              'Non-deterministic: Use a Repository dependency instead of localStorage in core.',
          },
          {
            name: 'sessionStorage',
            message:
              'Non-deterministic: Use a Repository dependency instead of sessionStorage in core.',
          },
          {
            name: 'navigator',
            message:
              'Non-deterministic: Use a DeviceProvider dependency instead of navigator in core.',
          },
          {
            name: 'location',
            message:
              'Non-deterministic: Use a RouterProvider dependency instead of location in core.',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'uuid',
                message:
                  'Non-deterministic: Use UuidProvider dependency instead of uuid in core.',
              },
              {
                name: 'react-native-uuid',
                message:
                  'Non-deterministic: Use UuidProvider dependency instead of react-native-uuid in core.',
              },
              {
                name: 'crypto',
                message:
                  'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
              },
              {
                name: '@faker-js/faker',
                message:
                  'Non-deterministic: Use data builders with injected dependencies instead of faker in core.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['core/**/*.builder.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['core/_ports_/**/*.ts', 'core/**/*.fixture.ts'],
      rules: {
        'no-restricted-globals': 'off',
      },
    },
    // no-restricted-properties not supported by OxLint - keep in ESLint
    // No non-deterministic property access in core
    {
      files: ['core/**/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-restricted-properties': [
          'error',
          {
            object: 'Math',
            property: 'random',
            message:
              'Non-deterministic: Use RandomProvider dependency instead of Math.random() in core.',
          },
          {
            object: 'process',
            property: 'env',
            message:
              'Non-deterministic: Use ConfigProvider dependency instead of process.env in core.',
          },
          {
            object: 'window',
            property: 'location',
            message:
              'Non-deterministic: Use RouterProvider dependency instead of window.location in core.',
          },
          {
            object: 'window',
            property: 'localStorage',
            message:
              'Non-deterministic: Use a Repository dependency instead of window.localStorage in core.',
          },
          {
            object: 'window',
            property: 'sessionStorage',
            message:
              'Non-deterministic: Use a Repository dependency instead of window.sessionStorage in core.',
          },
        ],
      },
    },
    // No vi/jest mocking in core tests (use dependency injection)
    {
      files: ['core/**/*.test.ts', 'core/**/*.spec.ts'],
      rules: {
        'no-restricted-properties': [
          'error',
          {
            object: 'vi',
            property: 'useFakeTimers',
            message:
              'Use DateProvider dependency injection instead of vi.useFakeTimers() in core tests.',
          },
          {
            object: 'vi',
            property: 'useRealTimers',
            message:
              'Use DateProvider dependency injection instead of vi.useRealTimers() in core tests.',
          },
          {
            object: 'vi',
            property: 'spyOn',
            message:
              'Use dependency injection (fakes/stubs) instead of vi.spyOn() in core tests.',
          },
          {
            object: 'jest',
            property: 'useFakeTimers',
            message:
              'Use DateProvider dependency injection instead of jest.useFakeTimers() in core tests.',
          },
          {
            object: 'jest',
            property: 'useRealTimers',
            message:
              'Use DateProvider dependency injection instead of jest.useRealTimers() in core tests.',
          },
          {
            object: 'jest',
            property: 'spyOn',
            message:
              'Use dependency injection (fakes/stubs) instead of jest.spyOn() in core tests.',
          },
        ],
      },
    },
    // Enforce boolean naming convention on type properties in core (our domain types)
    {
      files: ['core/**/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          // Keep interface naming convention
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
          // Boolean naming for variables, parameters, properties in core
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          },
          {
            selector: 'parameter',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          },
          {
            selector: 'classProperty',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
            leadingUnderscore: 'allow',
          },
          {
            selector: 'typeProperty',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          },
        ],
      },
    },
    // No data builders in production code (OxLint override excludedFiles don't work)
    {
      files: ['**/*.ts', '**/*.tsx'],
      excludedFiles: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.fixture.ts',
        '**/*.fixture.tsx',
        '**/*.builder.ts',
        '**/*.builder.tsx',
        '**/core/_tests_/**',
        '**/fake-data.*.ts',
        '**/preloadedStateForManualTesting.ts',
      ],
      rules: {
        'local-rules/no-data-builders-in-production': 'error',
      },
    },
    // Selectors - enforce no nested calls for readability (OxLint override scoping bug)
    {
      files: ['core/**/selectors/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'local-rules/no-nested-call-expressions': [
          'error',
          {
            allowedPatterns: [
              '^map$',
              '^filter$',
              '^flatMap$',
              '^find$',
              '^some$',
              '^every$',
              '^selectAll$',
              '^selectById$',
              '^selectIds$',
              '^selectEntities$',
              '^getSelectors$',
            ],
          },
        ],
      },
    },
    // Progressive enablement of no-nested-call-expressions rule
    // Uncomment each block as violations are fixed
    // See: docs/adr/conventions/no-nested-call-expressions.md
    //
    // {
    //   files: ['**/*.fixture.ts'],
    //   rules: {
    //     'local-rules/no-nested-call-expressions': 'error',
    //   },
    // },
    // {
    //   files: ['core/**/listeners/*.ts'],
    //   excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
    //   rules: {
    //     'local-rules/no-nested-call-expressions': 'error',
    //   },
    // },
    // {
    //   files: ['core/**/usecases/*.ts'],
    //   excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
    //   rules: {
    //     'local-rules/no-nested-call-expressions': 'error',
    //   },
    // },
    // {
    //   files: ['infra/**/*.ts'],
    //   excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
    //   rules: {
    //     'local-rules/no-nested-call-expressions': 'error',
    //   },
    // },
    // {
    //   files: ['ui/**/*.ts', 'ui/**/*.tsx'],
    //   excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
    //   rules: {
    //     'local-rules/no-nested-call-expressions': 'error',
    //   },
    // },
    // {
    //   files: ['app/**/*.ts', 'app/**/*.tsx'],
    //   rules: {
    //     'local-rules/no-nested-call-expressions': 'error',
    //   },
    // },
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
