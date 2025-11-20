/**
 * Local ESLint plugin for custom rules
 */

const noStylesheetMagicNumbers = require('../eslint-rules/no-stylesheet-magic-numbers.cjs')

module.exports = {
  rules: {
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
  },
}
