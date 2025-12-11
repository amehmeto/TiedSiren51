/**
 * Local ESLint plugin for custom rules
 */

const coreTestFileNaming = require('../eslint-rules/core-test-file-naming.cjs')
const expectSeparateActAssert = require('../eslint-rules/expect-separate-act-assert.cjs')
const noComplexJsxInConditionals = require('../eslint-rules/no-complex-jsx-in-conditionals.cjs')
const noIconSizeMagicNumbers = require('../eslint-rules/no-icon-size-magic-numbers.cjs')
const noStylesheetMagicNumbers = require('../eslint-rules/no-stylesheet-magic-numbers.cjs')
const oneSelectorPerFile = require('../eslint-rules/one-selector-per-file.cjs')
const oneUsecasePerFile = require('../eslint-rules/one-usecase-per-file.cjs')
const timeConstantMultiplication = require('../eslint-rules/time-constant-multiplication.cjs')
const infraMustRethrow = require('../eslint-rules/infra-must-rethrow.cjs')
const listenerErrorHandling = require('../eslint-rules/listener-error-handling.cjs')
const noTryCatchInCore = require('../eslint-rules/no-try-catch-in-core.cjs')

module.exports = {
  rules: {
    'core-test-file-naming': coreTestFileNaming,
    'expect-separate-act-assert': expectSeparateActAssert,
    'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
    'no-icon-size-magic-numbers': noIconSizeMagicNumbers,
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
    'one-selector-per-file': oneSelectorPerFile,
    'one-usecase-per-file': oneUsecasePerFile,
    'time-constant-multiplication': timeConstantMultiplication,
    'infra-must-rethrow': infraMustRethrow,
    'listener-error-handling': listenerErrorHandling,
    'no-try-catch-in-core': noTryCatchInCore,
  },
}
