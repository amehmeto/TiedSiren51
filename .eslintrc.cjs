// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  ignorePatterns: ['node_modules', '!.claude', 'eslint-rules/*.spec.ts'],
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
    'unicorn/prefer-ternary': 'error',
    'prettier/prettier': 'error',
    complexity: ['warn', { max: 10 }],
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
    // Custom local rules
    'local-rules/no-icon-size-magic-numbers': 'error',
    'local-rules/no-stylesheet-magic-numbers': 'error',
    'local-rules/no-complex-jsx-in-conditionals': [
      'error',
      {
        maxProps: 2,
        allowSimpleElements: true,
      },
    ],
    'local-rules/one-selector-per-file': 'error',
    'local-rules/one-usecase-per-file': 'error',
    'local-rules/core-test-file-naming': 'error',
    'local-rules/require-colocated-test': 'error',
    'local-rules/time-constant-multiplication': 'error',
    'local-rules/try-catch-isolation': 'error',
    'local-rules/inline-single-statement-handlers': 'error',
    // Error handling convention rules
    'local-rules/no-try-catch-in-core': 'error',
    'local-rules/listener-error-handling': 'error',
    'local-rules/infra-must-rethrow': 'error',
    'local-rules/infra-public-method-try-catch': 'error',
    'local-rules/infra-logger-prefix': 'error',
    'local-rules/file-naming-convention': 'error',
    'local-rules/no-index-in-core': 'error',
    'local-rules/selector-matches-filename': 'error',
    'local-rules/usecase-matches-filename': 'error',
    'local-rules/no-cross-layer-imports': 'error',
    'local-rules/listener-matches-filename': 'error',
    'local-rules/view-model-matches-filename': 'error',
    'local-rules/builder-matches-filename': 'error',
    'local-rules/fixture-matches-filename': 'error',
    'local-rules/one-listener-per-file': 'error',
    'local-rules/slice-matches-folder': 'error',
    'local-rules/repository-implementation-naming': 'error',
    'local-rules/gateway-implementation-naming': 'error',
    'local-rules/schema-matches-filename': 'error',
    'local-rules/one-view-model-per-file': 'error',
    'local-rules/reducer-in-domain-folder': 'error',
    'local-rules/no-module-level-constants': 'error',
    'local-rules/require-named-regex': 'error',
    // Disabled globally - too many valid patterns. Enable per-file as needed.
    // See: docs/adr/conventions/no-nested-call-expressions.md
    'local-rules/no-nested-call-expressions': 'off',
    'local-rules/prefer-array-destructuring': 'error',
    // Warn-only: many valid patterns use named variables for self-documentation
    'local-rules/prefer-inline-variable': 'warn',
    'local-rules/react-props-destructuring': 'error',
    // Extract call expressions from JSX props into variables for readability
    'local-rules/no-call-expression-in-jsx-props': 'error',
    // Enforce one React component per file
    'local-rules/one-component-per-file': 'error',
    // Disallow else-if statements - use separate ifs or nested if-else
    'local-rules/no-else-if': 'error',
    // Prevent direct adapter usage in UI layer - use selectors instead
    'local-rules/no-adapter-in-ui': 'error',
    // Prevent selecting entire Redux state - select specific slices instead
    'local-rules/no-entire-state-selector': 'error',
    // Extract complex expressions with long strings to variables
    'local-rules/no-complex-inline-arguments': 'error',
    // Warn when useCallback is unnecessarily wrapping a selector for useSelector
    'local-rules/no-usecallback-selector-wrapper': 'warn',
    // Prefer named selectors over inline state slice access
    'local-rules/prefer-named-selector': 'warn',
    // Enforce state as first parameter in selectors
    'local-rules/selector-state-first-param': 'error',
    // Prevent passing useSelector results as props - child should call useSelector itself
    'local-rules/no-selector-prop-drilling': [
      'error',
      {
        ignoredComponents: [
          'FlatList',
          'SectionList',
          'VirtualizedList',
          'TiedSButton',
          'CircularTimerDisplay',
        ],
      },
    ],
    // Prefer ternary over if-return followed by return
    'local-rules/prefer-ternary-return': ['error', { skipJsx: true }],
    // Prefer enum over string literal unions
    'local-rules/prefer-enum-over-string-union': [
      'error',
      { ignoredPatterns: ['-outline$', '^logo-', '^add-', '^remove-'] },
    ],
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
        // Extend no I-prefix rule to import aliases
        'local-rules/no-i-prefix-in-imports': 'error',
      },
    },
    {
      files: ['scripts/**/*.{js,cjs,mjs}', 'electron.js'],
      env: {
        node: true,
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        'local-rules/expect-separate-act-assert': 'error',
        // Test structure rules
        'local-rules/no-new-in-test-body': 'error',
        'local-rules/use-data-builders': 'error',
      },
    },
    // No data builders in production code
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
        '**/fake-data.*.ts', // Fake repositories for development/testing
        '**/preloadedStateForManualTesting.ts', // Manual testing utilities
      ],
      rules: {
        'local-rules/no-data-builders-in-production': 'error',
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
    // Selectors - enforce no nested calls for readability
    {
      files: ['core/**/selectors/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'local-rules/no-nested-call-expressions': [
          'error',
          {
            allowedPatterns: [
              // Array methods
              '^map$',
              '^filter$',
              '^flatMap$',
              '^find$',
              '^some$',
              '^every$',
              // Entity adapter
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
