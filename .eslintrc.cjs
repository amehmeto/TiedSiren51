// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  ignorePatterns: ['node_modules', '!.claude'],
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
    // Error handling convention rules
    'local-rules/no-try-catch-in-core': 'error',
    'local-rules/listener-error-handling': 'error',
    'local-rules/infra-must-rethrow': 'error',
    'local-rules/file-naming-convention': 'error',
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
          // Enforce boolean naming convention (is, has, should, can, did, will)
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
          },
          {
            selector: 'parameter',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
          },
          {
            selector: 'classProperty',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
            leadingUnderscore: 'allow',
          },
        ],
        // Extend no I-prefix rule to import aliases
        'local-rules/no-i-prefix-in-imports': 'error',
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
        'vitest/prefer-strict-equal': 'error',
        'local-rules/expect-separate-act-assert': 'error',
        // Test structure rules
        'local-rules/no-new-in-test-body': 'error',
        'local-rules/use-data-builders': 'error',
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
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
          },
          {
            selector: 'parameter',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
          },
          {
            selector: 'classProperty',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
            leadingUnderscore: 'allow',
          },
          {
            selector: 'typeProperty',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'has', 'should', 'can', 'did', 'will'],
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
