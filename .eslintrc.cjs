// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  root: true,
  ignorePatterns: ['node_modules', '!.claude', 'eslint-rules/*.spec.ts'],
  extends: [
    'expo',
    'prettier',
    'plugin:no-switch-statements/recommended',
    'plugin:jsonc/recommended-with-json',
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
    'no-else-return': 'error',
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
    'unicorn/prefer-ternary': 'error',
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
    // Prefer shorthand boolean JSX props: <Comp disabled /> over <Comp disabled={true} />
    'react/jsx-boolean-value': 'error',
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
    'local-rules/require-feature-flag-destructuring': 'error',
    'local-rules/time-constant-multiplication': 'error',
    'local-rules/try-catch-isolation': 'error',
    'local-rules/inline-single-statement-handlers': 'error',
    // Components should not check thunk results — use state-driven UI
    'local-rules/no-thunk-result-in-component': 'error',
    // Error handling convention rules
    'local-rules/no-try-catch-in-core': 'error',
    'local-rules/listener-error-handling': 'error',
    'local-rules/infra-must-rethrow': 'error',
    'local-rules/infra-public-method-try-catch': 'error',
    'local-rules/infra-logger-prefix': 'error',
    'local-rules/require-logger-in-catch': 'error',
    'local-rules/file-naming-convention': 'error',
    'local-rules/no-index-in-core': 'error',
    'local-rules/no-inline-import-type': 'error',
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
    'local-rules/no-consecutive-duplicate-returns': 'error',
    // Disabled globally - too many valid patterns. Enable per-file as needed.
    // See: docs/adr/conventions/no-nested-call-expressions.md
    'local-rules/no-nested-call-expressions': 'off',
    'local-rules/no-redundant-nullish-ternary': 'error',
    'local-rules/prefer-array-destructuring': 'error',
    'local-rules/prefer-object-destructuring': [
      'warn',
      {
        threshold: 4,
        ignoredObjects: [
          'T',
          'styles',
          'fixture',
          'viewModel',
          'BlocklistViewModel',
          'HomeViewModel',
          'BlocklistTabKey',
          'TabScreens',
        ],
      },
    ],
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
    'local-rules/no-usecallback-selector-wrapper': 'error',
    // Prefer named selectors over inline state slice access
    'local-rules/prefer-named-selector': 'error',
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
    // Names with "And"/"Or" at word boundaries suggest multiple responsibilities
    'local-rules/no-and-or-in-names': 'error',
    // Prefer object map over 3+ sequential ifs testing the same variable
    'local-rules/prefer-jump-table': 'error',
    // Flag string literals in comparisons when a matching enum value exists
    'local-rules/no-enum-value-as-string-literal': 'error',
    // Prefer short-circuit (&&) over ternary with null for conditional JSX
    'local-rules/prefer-short-circuit-jsx': 'error',
    // Prefer ternary over complementary && conditions in JSX
    'local-rules/prefer-ternary-jsx': 'error',
    // Extract long function arguments into named variables for readability
    'local-rules/prefer-extracted-long-params': [
      'error',
      {
        exemptFunctions: ['createTestStore'],
        transparentWrappers: ['dispatch'],
      },
    ],
    // Extract inline object types into named type aliases
    'local-rules/no-inline-object-type': 'error',
    // Disallow .unwrap() — rely on Redux state for thunk success/error
    'local-rules/no-unwrap': 'error',
    // Disallow overly generic variable and function names
    'local-rules/no-lame-naming': 'error',
    // Disallow passing 3+ props from the same object — pass the object directly
    'local-rules/no-redundant-prop-spreading': [
      'error',
      { ignoredObjects: ['styles', 'form'] },
    ],
    // Prefer enum over string literal unions
    'local-rules/prefer-enum-over-string-union': [
      'error',
      { ignoredPatterns: ['-outline$', '^logo-', '^add-', '^remove-'] },
    ],
    // Extract large JSX elements with few dynamic props into reusable components
    'local-rules/prefer-extracted-component': 'warn',
  },
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
      rules: {
        'no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
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
        'vitest/prefer-strict-equal': 'error',
        'local-rules/expect-separate-act-assert': 'error',
        // Test structure rules
        'local-rules/no-new-in-test-body': 'error',
        'local-rules/use-data-builders': 'error',
        'local-rules/no-generic-result-variable': 'error',
        // Require type parameter on it.each / test.each / describe.each
        'local-rules/require-typed-each': 'error',
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
    // No non-deterministic values in core (use injected dependencies)
    {
      files: ['core/**/*.ts'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-restricted-globals': [
          'error',
          // Time
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
          // Async timing
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
          // Randomness
          {
            name: 'crypto',
            message:
              'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
          },
          // Network I/O
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
          // External state
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
          // Environment/device info
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
    // Allow faker in data builders (they generate test data)
    {
      files: ['core/**/*.builder.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    // Allow Date in port type definitions and test fixtures
    {
      files: ['core/_ports_/**/*.ts', 'core/**/*.fixture.ts'],
      rules: {
        'no-restricted-globals': 'off',
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
    {
      files: ['**/*.fixture.ts'],
      rules: {
        'local-rules/no-nested-call-expressions': [
          'error',
          {
            allowNoArguments: true,
          },
        ],
      },
    },
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
    {
      files: ['ui/**/*.ts', 'ui/**/*.tsx'],
      excludedFiles: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'local-rules/no-nested-call-expressions': [
          'error',
          {
            allowNoArguments: true,
          },
        ],
        'local-rules/no-unused-test-id': 'error',
      },
    },
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
