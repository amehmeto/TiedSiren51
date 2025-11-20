/**
 * Local ESLint plugin for custom rules
 */

const noStylesheetMagicNumbers = require('../eslint-rules/no-stylesheet-magic-numbers.cjs')
const noComplexJsxInConditionals = require('../eslint-rules/no-complex-jsx-in-conditionals.cjs')

module.exports = {
  rules: {
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
    'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
  },
}
