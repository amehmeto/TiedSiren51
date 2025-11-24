/**
 * Local ESLint plugin for custom rules
 */

const noStylesheetMagicNumbers = require('../eslint-rules/no-stylesheet-magic-numbers.cjs')
const noComplexJsxInConditionals = require('../eslint-rules/no-complex-jsx-in-conditionals.cjs')
const oneSelectorPerFile = require('../eslint-rules/one-selector-per-file.cjs')
const oneUsecasePerFile = require('../eslint-rules/one-usecase-per-file.cjs')

module.exports = {
  rules: {
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
    'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
    'one-selector-per-file': oneSelectorPerFile,
    'one-usecase-per-file': oneUsecasePerFile,
  },
}
