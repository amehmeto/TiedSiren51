/**
 * Local ESLint plugin for custom rules
 */

const coreTestFileNaming = require('../eslint-rules/core-test-file-naming.cjs')
const expectSeparateActAssert = require('../eslint-rules/expect-separate-act-assert.cjs')
const inlineSingleStatementHandlers = require('../eslint-rules/inline-single-statement-handlers.cjs')
const noComplexJsxInConditionals = require('../eslint-rules/no-complex-jsx-in-conditionals.cjs')
const noIconSizeMagicNumbers = require('../eslint-rules/no-icon-size-magic-numbers.cjs')
const noIPrefixInImports = require('../eslint-rules/no-i-prefix-in-imports.cjs')
const noStylesheetMagicNumbers = require('../eslint-rules/no-stylesheet-magic-numbers.cjs')
const oneSelectorPerFile = require('../eslint-rules/one-selector-per-file.cjs')
const oneUsecasePerFile = require('../eslint-rules/one-usecase-per-file.cjs')
const timeConstantMultiplication = require('../eslint-rules/time-constant-multiplication.cjs')
const tryCatchIsolation = require('../eslint-rules/try-catch-isolation.cjs')
const infraMustRethrow = require('../eslint-rules/infra-must-rethrow.cjs')
const listenerErrorHandling = require('../eslint-rules/listener-error-handling.cjs')
const noTryCatchInCore = require('../eslint-rules/no-try-catch-in-core.cjs')
const noNewInTestBody = require('../eslint-rules/no-new-in-test-body.cjs')
const requireColocatedTest = require('../eslint-rules/require-colocated-test.cjs')
const useDataBuilders = require('../eslint-rules/use-data-builders.cjs')
const fileNamingConvention = require('../eslint-rules/file-naming-convention.cjs')
const noIndexInCore = require('../eslint-rules/no-index-in-core.cjs')
const selectorMatchesFilename = require('../eslint-rules/selector-matches-filename.cjs')
const usecaseMatchesFilename = require('../eslint-rules/usecase-matches-filename.cjs')
const noCrossLayerImports = require('../eslint-rules/no-cross-layer-imports.cjs')
const listenerMatchesFilename = require('../eslint-rules/listener-matches-filename.cjs')
const viewModelMatchesFilename = require('../eslint-rules/view-model-matches-filename.cjs')
const builderMatchesFilename = require('../eslint-rules/builder-matches-filename.cjs')
const fixtureMatchesFilename = require('../eslint-rules/fixture-matches-filename.cjs')
const oneListenerPerFile = require('../eslint-rules/one-listener-per-file.cjs')
const sliceMatchesFolder = require('../eslint-rules/slice-matches-folder.cjs')
const repositoryImplementationNaming = require('../eslint-rules/repository-implementation-naming.cjs')
const gatewayImplementationNaming = require('../eslint-rules/gateway-implementation-naming.cjs')
const schemaMatchesFilename = require('../eslint-rules/schema-matches-filename.cjs')
const oneViewModelPerFile = require('../eslint-rules/one-view-model-per-file.cjs')
const reducerInDomainFolder = require('../eslint-rules/reducer-in-domain-folder.cjs')

module.exports = {
  rules: {
    'core-test-file-naming': coreTestFileNaming,
    'file-naming-convention': fileNamingConvention,
    'no-index-in-core': noIndexInCore,
    'selector-matches-filename': selectorMatchesFilename,
    'expect-separate-act-assert': expectSeparateActAssert,
    'inline-single-statement-handlers': inlineSingleStatementHandlers,
    'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
    'no-icon-size-magic-numbers': noIconSizeMagicNumbers,
    'no-i-prefix-in-imports': noIPrefixInImports,
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
    'one-selector-per-file': oneSelectorPerFile,
    'one-usecase-per-file': oneUsecasePerFile,
    'time-constant-multiplication': timeConstantMultiplication,
    'try-catch-isolation': tryCatchIsolation,
    'infra-must-rethrow': infraMustRethrow,
    'listener-error-handling': listenerErrorHandling,
    'no-try-catch-in-core': noTryCatchInCore,
    'no-new-in-test-body': noNewInTestBody,
    'require-colocated-test': requireColocatedTest,
    'use-data-builders': useDataBuilders,
    'usecase-matches-filename': usecaseMatchesFilename,
    'no-cross-layer-imports': noCrossLayerImports,
    'listener-matches-filename': listenerMatchesFilename,
    'view-model-matches-filename': viewModelMatchesFilename,
    'builder-matches-filename': builderMatchesFilename,
    'fixture-matches-filename': fixtureMatchesFilename,
    'one-listener-per-file': oneListenerPerFile,
    'slice-matches-folder': sliceMatchesFolder,
    'repository-implementation-naming': repositoryImplementationNaming,
    'gateway-implementation-naming': gatewayImplementationNaming,
    'schema-matches-filename': schemaMatchesFilename,
    'one-view-model-per-file': oneViewModelPerFile,
    'reducer-in-domain-folder': reducerInDomainFolder,
  },
}
