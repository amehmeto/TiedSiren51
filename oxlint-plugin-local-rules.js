// OxLint local rules plugin — aggregates all custom ESM rules for oxlint --plugin
import builderMatchesFilename from './oxlint-rules/builder-matches-filename.js'
import coreNoRestrictedGlobals from './oxlint-rules/core-no-restricted-globals.js'
import coreNoRestrictedImports from './oxlint-rules/core-no-restricted-imports.js'
import coreNoRestrictedProperties from './oxlint-rules/core-no-restricted-properties.js'
import coreTestFileNaming from './oxlint-rules/core-test-file-naming.js'
import coreTestNoRestrictedProperties from './oxlint-rules/core-test-no-restricted-properties.js'
import curlyMultiOrNest from './oxlint-rules/curly-multi-or-nest.js'
import expectSeparateActAssert from './oxlint-rules/expect-separate-act-assert.js'
import fileNamingConvention from './oxlint-rules/file-naming-convention.js'
import fixtureMatchesFilename from './oxlint-rules/fixture-matches-filename.js'
import gatewayImplementationNaming from './oxlint-rules/gateway-implementation-naming.js'
import infraLoggerPrefix from './oxlint-rules/infra-logger-prefix.js'
import infraMustRethrow from './oxlint-rules/infra-must-rethrow.js'
import infraPublicMethodTryCatch from './oxlint-rules/infra-public-method-try-catch.js'
import inlineSingleStatementHandlers from './oxlint-rules/inline-single-statement-handlers.js'
import linesBetweenClassMembers from './oxlint-rules/lines-between-class-members.js'
import listenerErrorHandling from './oxlint-rules/listener-error-handling.js'
import listenerMatchesFilename from './oxlint-rules/listener-matches-filename.js'
import maxStatementsPerLine from './oxlint-rules/max-statements-per-line.js'
import namingConventionBooleanPrefix from './oxlint-rules/naming-convention-boolean-prefix.js'
import noAdapterInUi from './oxlint-rules/no-adapter-in-ui.js'
import noAndOrInNames from './oxlint-rules/no-and-or-in-names.js'
import noCallExpressionInJsxProps from './oxlint-rules/no-call-expression-in-jsx-props.js'
import noComplexInlineArguments from './oxlint-rules/no-complex-inline-arguments.js'
import noComplexJsxInConditionals from './oxlint-rules/no-complex-jsx-in-conditionals.js'
import noConsecutiveDuplicateReturns from './oxlint-rules/no-consecutive-duplicate-returns.js'
import noCrossLayerImports from './oxlint-rules/no-cross-layer-imports.js'
import noDataBuildersInProduction from './oxlint-rules/no-data-builders-in-production.js'
import noDateNow from './oxlint-rules/no-date-now.js'
import noElseIf from './oxlint-rules/no-else-if.js'
import noEntireStateSelector from './oxlint-rules/no-entire-state-selector.js'
import noEnumValueAsStringLiteral from './oxlint-rules/no-enum-value-as-string-literal.js'
import noGenericResultVariable from './oxlint-rules/no-generic-result-variable.js'
import noIPrefixInImports from './oxlint-rules/no-i-prefix-in-imports.js'
import noIconSizeMagicNumbers from './oxlint-rules/no-icon-size-magic-numbers.js'
import noIndexInCore from './oxlint-rules/no-index-in-core.js'
import noInlineImportType from './oxlint-rules/no-inline-import-type.js'
import noInlineObjectType from './oxlint-rules/no-inline-object-type.js'
import noLameNaming from './oxlint-rules/no-lame-naming.js'
import noModuleLevelConstants from './oxlint-rules/no-module-level-constants.js'
import noNestedCallExpressions from './oxlint-rules/no-nested-call-expressions.js'
import noNewInTestBody from './oxlint-rules/no-new-in-test-body.js'
import noRedundantNullishTernary from './oxlint-rules/no-redundant-nullish-ternary.js'
import noRedundantPropSpreading from './oxlint-rules/no-redundant-prop-spreading.js'
import noSelectorPropDrilling from './oxlint-rules/no-selector-prop-drilling.js'
import noStylesheetMagicNumbers from './oxlint-rules/no-stylesheet-magic-numbers.js'
import noSwitch from './oxlint-rules/no-switch.js'
import noTernaryFalseFallback from './oxlint-rules/no-ternary-false-fallback.js'
import noThunkResultInComponent from './oxlint-rules/no-thunk-result-in-component.js'
import noTryCatchInCore from './oxlint-rules/no-try-catch-in-core.js'
import noUnusedTestId from './oxlint-rules/no-unused-test-id.js'
import noUnwrap from './oxlint-rules/no-unwrap.js'
import noUsecallbackSelectorWrapper from './oxlint-rules/no-usecallback-selector-wrapper.js'
import objectShorthand from './oxlint-rules/object-shorthand.js'
import oneComponentPerFile from './oxlint-rules/one-component-per-file.js'
import oneListenerPerFile from './oxlint-rules/one-listener-per-file.js'
import oneSelectorPerFile from './oxlint-rules/one-selector-per-file.js'
import oneUsecasePerFile from './oxlint-rules/one-usecase-per-file.js'
import oneViewModelPerFile from './oxlint-rules/one-view-model-per-file.js'
import paddingLineBetweenBlockLike from './oxlint-rules/padding-line-between-block-like.js'
import preferArrayDestructuring from './oxlint-rules/prefer-array-destructuring.js'
import preferEnumOverStringUnion from './oxlint-rules/prefer-enum-over-string-union.js'
import preferExtractedComponent from './oxlint-rules/prefer-extracted-component.js'
import preferExtractedLongParams from './oxlint-rules/prefer-extracted-long-params.js'
import preferInlineVariable from './oxlint-rules/prefer-inline-variable.js'
import preferJumpTable from './oxlint-rules/prefer-jump-table.js'
import preferNamedSelector from './oxlint-rules/prefer-named-selector.js'
import preferObjectDestructuring from './oxlint-rules/prefer-object-destructuring.js'
import preferParameterizedTest from './oxlint-rules/prefer-parameterized-test.js'
import preferShortCircuitJsx from './oxlint-rules/prefer-short-circuit-jsx.js'
import preferTernaryJsx from './oxlint-rules/prefer-ternary-jsx.js'
import preferTernaryReturn from './oxlint-rules/prefer-ternary-return.js'
import reactPropsDestructuring from './oxlint-rules/react-props-destructuring.js'
import reducerInDomainFolder from './oxlint-rules/reducer-in-domain-folder.js'
import repositoryImplementationNaming from './oxlint-rules/repository-implementation-naming.js'
import requireColocatedTest from './oxlint-rules/require-colocated-test.js'
import requireFeatureFlagDestructuring from './oxlint-rules/require-feature-flag-destructuring.js'
import requireLoggerInCatch from './oxlint-rules/require-logger-in-catch.js'
import requireNamedRegex from './oxlint-rules/require-named-regex.js'
import requireTypedEach from './oxlint-rules/require-typed-each.js'
import schemaMatchesFilename from './oxlint-rules/schema-matches-filename.js'
import selectorMatchesFilename from './oxlint-rules/selector-matches-filename.js'
import selectorStateFirstParam from './oxlint-rules/selector-state-first-param.js'
import sliceMatchesFolder from './oxlint-rules/slice-matches-folder.js'
import timeConstantMultiplication from './oxlint-rules/time-constant-multiplication.js'
import tryCatchIsolation from './oxlint-rules/try-catch-isolation.js'
import useDataBuilders from './oxlint-rules/use-data-builders.js'
import usecaseMatchesFilename from './oxlint-rules/usecase-matches-filename.js'
import viewModelMatchesFilename from './oxlint-rules/view-model-matches-filename.js'

export default {
  meta: { name: 'local-rules' },
  rules: {
    'builder-matches-filename': builderMatchesFilename,
    'core-no-restricted-globals': coreNoRestrictedGlobals,
    'core-no-restricted-imports': coreNoRestrictedImports,
    'core-no-restricted-properties': coreNoRestrictedProperties,
    'core-test-file-naming': coreTestFileNaming,
    'core-test-no-restricted-properties': coreTestNoRestrictedProperties,
    'curly-multi-or-nest': curlyMultiOrNest,
    'expect-separate-act-assert': expectSeparateActAssert,
    'file-naming-convention': fileNamingConvention,
    'fixture-matches-filename': fixtureMatchesFilename,
    'gateway-implementation-naming': gatewayImplementationNaming,
    'infra-logger-prefix': infraLoggerPrefix,
    'infra-must-rethrow': infraMustRethrow,
    'infra-public-method-try-catch': infraPublicMethodTryCatch,
    'inline-single-statement-handlers': inlineSingleStatementHandlers,
    'lines-between-class-members': linesBetweenClassMembers,
    'listener-error-handling': listenerErrorHandling,
    'listener-matches-filename': listenerMatchesFilename,
    'max-statements-per-line': maxStatementsPerLine,
    'naming-convention-boolean-prefix': namingConventionBooleanPrefix,
    'no-adapter-in-ui': noAdapterInUi,
    'no-and-or-in-names': noAndOrInNames,
    'no-call-expression-in-jsx-props': noCallExpressionInJsxProps,
    'no-complex-inline-arguments': noComplexInlineArguments,
    'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
    'no-consecutive-duplicate-returns': noConsecutiveDuplicateReturns,
    'no-cross-layer-imports': noCrossLayerImports,
    'no-data-builders-in-production': noDataBuildersInProduction,
    'no-date-now': noDateNow,
    'no-else-if': noElseIf,
    'no-entire-state-selector': noEntireStateSelector,
    'no-enum-value-as-string-literal': noEnumValueAsStringLiteral,
    'no-generic-result-variable': noGenericResultVariable,
    'no-i-prefix-in-imports': noIPrefixInImports,
    'no-icon-size-magic-numbers': noIconSizeMagicNumbers,
    'no-index-in-core': noIndexInCore,
    'no-inline-import-type': noInlineImportType,
    'no-inline-object-type': noInlineObjectType,
    'no-lame-naming': noLameNaming,
    'no-module-level-constants': noModuleLevelConstants,
    'no-nested-call-expressions': noNestedCallExpressions,
    'no-new-in-test-body': noNewInTestBody,
    'no-redundant-nullish-ternary': noRedundantNullishTernary,
    'no-redundant-prop-spreading': noRedundantPropSpreading,
    'no-selector-prop-drilling': noSelectorPropDrilling,
    'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
    'no-switch': noSwitch,
    'no-ternary-false-fallback': noTernaryFalseFallback,
    'no-thunk-result-in-component': noThunkResultInComponent,
    'no-try-catch-in-core': noTryCatchInCore,
    'no-unused-test-id': noUnusedTestId,
    'no-unwrap': noUnwrap,
    'no-usecallback-selector-wrapper': noUsecallbackSelectorWrapper,
    'object-shorthand': objectShorthand,
    'one-component-per-file': oneComponentPerFile,
    'one-listener-per-file': oneListenerPerFile,
    'one-selector-per-file': oneSelectorPerFile,
    'one-usecase-per-file': oneUsecasePerFile,
    'one-view-model-per-file': oneViewModelPerFile,
    'padding-line-between-block-like': paddingLineBetweenBlockLike,
    'prefer-array-destructuring': preferArrayDestructuring,
    'prefer-enum-over-string-union': preferEnumOverStringUnion,
    'prefer-extracted-component': preferExtractedComponent,
    'prefer-extracted-long-params': preferExtractedLongParams,
    'prefer-inline-variable': preferInlineVariable,
    'prefer-jump-table': preferJumpTable,
    'prefer-named-selector': preferNamedSelector,
    'prefer-object-destructuring': preferObjectDestructuring,
    'prefer-parameterized-test': preferParameterizedTest,
    'prefer-short-circuit-jsx': preferShortCircuitJsx,
    'prefer-ternary-jsx': preferTernaryJsx,
    'prefer-ternary-return': preferTernaryReturn,
    'react-props-destructuring': reactPropsDestructuring,
    'reducer-in-domain-folder': reducerInDomainFolder,
    'repository-implementation-naming': repositoryImplementationNaming,
    'require-colocated-test': requireColocatedTest,
    'require-feature-flag-destructuring': requireFeatureFlagDestructuring,
    'require-logger-in-catch': requireLoggerInCatch,
    'require-named-regex': requireNamedRegex,
    'require-typed-each': requireTypedEach,
    'schema-matches-filename': schemaMatchesFilename,
    'selector-matches-filename': selectorMatchesFilename,
    'selector-state-first-param': selectorStateFirstParam,
    'slice-matches-folder': sliceMatchesFolder,
    'time-constant-multiplication': timeConstantMultiplication,
    'try-catch-isolation': tryCatchIsolation,
    'use-data-builders': useDataBuilders,
    'usecase-matches-filename': usecaseMatchesFilename,
    'view-model-matches-filename': viewModelMatchesFilename,
  },
}
