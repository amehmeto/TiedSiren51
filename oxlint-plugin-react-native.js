// ESM wrapper for eslint-plugin-react-native — loaded by OxLint jsPlugins
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const reactNative = require('eslint-plugin-react-native')

export default {
  meta: { name: 'react-native' },
  rules: {
    'no-color-literals': reactNative.rules['no-color-literals'],
    'no-inline-styles': reactNative.rules['no-inline-styles'],
    'no-raw-text': reactNative.rules['no-raw-text'],
    'no-single-element-style-arrays':
      reactNative.rules['no-single-element-style-arrays'],
    'no-unused-styles': reactNative.rules['no-unused-styles'],
  },
}
