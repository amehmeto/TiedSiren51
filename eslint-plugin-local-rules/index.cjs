/**
 * Local ESLint plugin for custom rules
 */

const coreTestFileNaming = require('../eslint-rules/core-test-file-naming.cjs')
const expectSeparateActAssert = require('../eslint-rules/expect-separate-act-assert.cjs')
const noComplexJsxInConditionals = require('../eslint-rules/no-complex-jsx-in-conditionals.cjs')
const noIconSizeMagicNumbers = require('../eslint-rules/no-icon-size-magic-numbers.cjs')
const noIPrefixInImports = require('../eslint-rules/no-i-prefix-in-imports.cjs')
const noStylesheetMagicNumbers = require('../eslint-rules/no-stylesheet-magic-numbers.cjs')
const oneSelectorPerFile = require('../eslint-rules/one-selector-per-file.cjs')
const oneUsecasePerFile = require('../eslint-rules/one-usecase-per-file.cjs')
const timeConstantMultiplication = require('../eslint-rules/time-constant-multiplication.cjs')
const tryCatchIsolation = require('../eslint-rules/try-catch-isolation.cjs')

module.exports = {
  rules: {
    'core-test-file-naming': coreTestFileNaming,
    'expect-separate-act-assert': expectSeparateActAssert,
    'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
    'no-icon-size-magic-numbers': noIconSizeMagicNumbers,
    'no-i-prefix-in-imports': noIPrefixInImports,
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
    'one-selector-per-file': oneSelectorPerFile,
    'one-usecase-per-file': oneUsecasePerFile,
    'time-constant-multiplication': timeConstantMultiplication,
    'try-catch-isolation': tryCatchIsolation,
  },
}
