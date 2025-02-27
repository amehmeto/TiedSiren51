import tsconfigPaths from 'vite-tsconfig-paths'

export default {
  test: {
    server: {
      deps: {
        inline: ['react-native-url-polyfill'],
        interopDefault: true,
      },
    },
    exclude: ['infra/**/prisma.*.test.ts', '**/node_modules/**'],
  },
  plugins: [tsconfigPaths()],
}
