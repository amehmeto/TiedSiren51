import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    deps: {
      interopDefault: true,
      inline: [
        'react-native-url-polyfill',
        '@prisma/client/react-native',
        '@prisma/react-native',
      ],
    },
    server: {
      deps: {
        inline: ['react-native-url-polyfill'],
      },
    },
  },
})
