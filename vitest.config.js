import tsconfigPaths from 'vite-tsconfig-paths'

export default {
  test: {
    server: {
      deps: {
        inline: [
          'react-native-url-polyfill',
          '@prisma/client',
          '@prisma/react-native',
        ],
        interopDefault: true,
      },
    },
    exclude: [
      'infra/**/prisma.*.test.ts',
      '**/node_modules/**',
      'eslint-rules/**',
    ],
    coverage: {
      thresholds: {
        '**/*.schema.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/*.helper.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/selectors/*.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/*.view-model.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/usecases/*.usecase.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        '**/listeners/*.listener.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
  plugins: [tsconfigPaths()],
}
