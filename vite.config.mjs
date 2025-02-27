import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    server: {
      deps: {
        inline: [
          'react-native-url-polyfill',
          '@prisma/client',
          '@prisma/react-native',
        ],
      },
    },
  },
})
