// ESM wrapper for eslint-plugin-sonarjs — loaded by OxLint jsPlugins
// Only includes the subset of sonarjs rules used by this project.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sonarjs = require('eslint-plugin-sonarjs')

export default {
  meta: { name: 'sonarjs' },
  rules: {
    'no-collapsible-if': sonarjs.rules['no-collapsible-if'],
    'no-collection-size-mischeck': sonarjs.rules['no-collection-size-mischeck'],
    'no-duplicated-branches': sonarjs.rules['no-duplicated-branches'],
    'no-gratuitous-expressions': sonarjs.rules['no-gratuitous-expressions'],
    'no-identical-functions': sonarjs.rules['no-identical-functions'],
    'no-redundant-boolean': sonarjs.rules['no-redundant-boolean'],
    'no-redundant-jump': sonarjs.rules['no-redundant-jump'],
    'no-same-line-conditional': sonarjs.rules['no-same-line-conditional'],
    'no-unused-collection': sonarjs.rules['no-unused-collection'],
    'no-useless-catch': sonarjs.rules['no-useless-catch'],
    'prefer-immediate-return': sonarjs.rules['prefer-immediate-return'],
    'prefer-object-literal': sonarjs.rules['prefer-object-literal'],
    'prefer-single-boolean-return':
      sonarjs.rules['prefer-single-boolean-return'],
  },
}
