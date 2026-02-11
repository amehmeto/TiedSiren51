import coreTestFileNaming from './eslint-rules/core-test-file-naming.js'
import expectSeparateActAssert from './eslint-rules/expect-separate-act-assert.js'
import inlineSingleStatementHandlers from './eslint-rules/inline-single-statement-handlers.js'
import noComplexJsxInConditionals from './eslint-rules/no-complex-jsx-in-conditionals.js'
import noIconSizeMagicNumbers from './eslint-rules/no-icon-size-magic-numbers.js'
import noIPrefixInImports from './eslint-rules/no-i-prefix-in-imports.js'
import noStylesheetMagicNumbers from './eslint-rules/no-stylesheet-magic-numbers.js'
import oneSelectorPerFile from './eslint-rules/one-selector-per-file.js'
import oneUsecasePerFile from './eslint-rules/one-usecase-per-file.js'
import timeConstantMultiplication from './eslint-rules/time-constant-multiplication.js'
import tryCatchIsolation from './eslint-rules/try-catch-isolation.js'
import infraMustRethrow from './eslint-rules/infra-must-rethrow.js'
import infraPublicMethodTryCatch from './eslint-rules/infra-public-method-try-catch.js'
import infraLoggerPrefix from './eslint-rules/infra-logger-prefix.js'
import listenerErrorHandling from './eslint-rules/listener-error-handling.js'
import noTryCatchInCore from './eslint-rules/no-try-catch-in-core.js'
import noNewInTestBody from './eslint-rules/no-new-in-test-body.js'
import requireColocatedTest from './eslint-rules/require-colocated-test.js'
import useDataBuilders from './eslint-rules/use-data-builders.js'
import noDataBuildersInProduction from './eslint-rules/no-data-builders-in-production.js'
import fileNamingConvention from './eslint-rules/file-naming-convention.js'
import noIndexInCore from './eslint-rules/no-index-in-core.js'
import selectorMatchesFilename from './eslint-rules/selector-matches-filename.js'
import usecaseMatchesFilename from './eslint-rules/usecase-matches-filename.js'
import noCrossLayerImports from './eslint-rules/no-cross-layer-imports.js'
import listenerMatchesFilename from './eslint-rules/listener-matches-filename.js'
import viewModelMatchesFilename from './eslint-rules/view-model-matches-filename.js'
import builderMatchesFilename from './eslint-rules/builder-matches-filename.js'
import fixtureMatchesFilename from './eslint-rules/fixture-matches-filename.js'
import oneListenerPerFile from './eslint-rules/one-listener-per-file.js'
import sliceMatchesFolder from './eslint-rules/slice-matches-folder.js'
import repositoryImplementationNaming from './eslint-rules/repository-implementation-naming.js'
import gatewayImplementationNaming from './eslint-rules/gateway-implementation-naming.js'
import schemaMatchesFilename from './eslint-rules/schema-matches-filename.js'
import oneViewModelPerFile from './eslint-rules/one-view-model-per-file.js'
import reducerInDomainFolder from './eslint-rules/reducer-in-domain-folder.js'
import noModuleLevelConstants from './eslint-rules/no-module-level-constants.js'
import requireNamedRegex from './eslint-rules/require-named-regex.js'
import noNestedCallExpressions from './eslint-rules/no-nested-call-expressions.js'
import preferArrayDestructuring from './eslint-rules/prefer-array-destructuring.js'
import preferInlineVariable from './eslint-rules/prefer-inline-variable.js'
import reactPropsDestructuring from './eslint-rules/react-props-destructuring.js'
import noCallExpressionInJsxProps from './eslint-rules/no-call-expression-in-jsx-props.js'
import oneComponentPerFile from './eslint-rules/one-component-per-file.js'
import noElseIf from './eslint-rules/no-else-if.js'
import noAdapterInUi from './eslint-rules/no-adapter-in-ui.js'
import noEntireStateSelector from './eslint-rules/no-entire-state-selector.js'
import noComplexInlineArguments from './eslint-rules/no-complex-inline-arguments.js'
import noUsecallbackSelectorWrapper from './eslint-rules/no-usecallback-selector-wrapper.js'
import preferNamedSelector from './eslint-rules/prefer-named-selector.js'
import selectorStateFirstParam from './eslint-rules/selector-state-first-param.js'
import noSelectorPropDrilling from './eslint-rules/no-selector-prop-drilling.js'
import preferTernaryReturn from './eslint-rules/prefer-ternary-return.js'
import preferEnumOverStringUnion from './eslint-rules/prefer-enum-over-string-union.js'

export default {
  meta: { name: 'local-rules' },
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
    'infra-public-method-try-catch': infraPublicMethodTryCatch,
    'infra-logger-prefix': infraLoggerPrefix,
    'listener-error-handling': listenerErrorHandling,
    'no-try-catch-in-core': noTryCatchInCore,
    'no-new-in-test-body': noNewInTestBody,
    'require-colocated-test': requireColocatedTest,
    'use-data-builders': useDataBuilders,
    'no-data-builders-in-production': noDataBuildersInProduction,
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
    'no-module-level-constants': noModuleLevelConstants,
    'require-named-regex': requireNamedRegex,
    'no-nested-call-expressions': noNestedCallExpressions,
    'prefer-array-destructuring': preferArrayDestructuring,
    'prefer-inline-variable': preferInlineVariable,
    'react-props-destructuring': reactPropsDestructuring,
    'no-call-expression-in-jsx-props': noCallExpressionInJsxProps,
    'one-component-per-file': oneComponentPerFile,
    'no-else-if': noElseIf,
    'no-adapter-in-ui': noAdapterInUi,
    'no-entire-state-selector': noEntireStateSelector,
    'no-complex-inline-arguments': noComplexInlineArguments,
    'no-usecallback-selector-wrapper': noUsecallbackSelectorWrapper,
    'prefer-named-selector': preferNamedSelector,
    'selector-state-first-param': selectorStateFirstParam,
    'no-selector-prop-drilling': noSelectorPropDrilling,
    'prefer-ternary-return': preferTernaryReturn,
    'prefer-enum-over-string-union': preferEnumOverStringUnion,
  },
}
