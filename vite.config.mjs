import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    deps: {
      inline: ['react-native-url-polyfill', '@prisma/client/react-native'],
    },
  },
})
