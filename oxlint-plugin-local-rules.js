// OxLint local rules plugin — aggregates all custom ESM rules for oxlint --plugin
import builderMatchesFilename from './eslint-rules/builder-matches-filename.js'
import coreNoRestrictedGlobals from './eslint-rules/core-no-restricted-globals.js'
import coreNoRestrictedImports from './eslint-rules/core-no-restricted-imports.js'
import coreNoRestrictedProperties from './eslint-rules/core-no-restricted-properties.js'
import coreTestFileNaming from './eslint-rules/core-test-file-naming.js'
import coreTestNoRestrictedProperties from './eslint-rules/core-test-no-restricted-properties.js'
import curlyMultiOrNest from './eslint-rules/curly-multi-or-nest.js'
import expectSeparateActAssert from './eslint-rules/expect-separate-act-assert.js'
import fileNamingConvention from './eslint-rules/file-naming-convention.js'
import fixtureMatchesFilename from './eslint-rules/fixture-matches-filename.js'
import gatewayImplementationNaming from './eslint-rules/gateway-implementation-naming.js'
import infraLoggerPrefix from './eslint-rules/infra-logger-prefix.js'
import infraMustRethrow from './eslint-rules/infra-must-rethrow.js'
import infraPublicMethodTryCatch from './eslint-rules/infra-public-method-try-catch.js'
import inlineSingleStatementHandlers from './eslint-rules/inline-single-statement-handlers.js'
import linesBetweenClassMembers from './eslint-rules/lines-between-class-members.js'
import listenerErrorHandling from './eslint-rules/listener-error-handling.js'
import listenerMatchesFilename from './eslint-rules/listener-matches-filename.js'
import maxStatementsPerLine from './eslint-rules/max-statements-per-line.js'
import namingConventionBooleanPrefix from './eslint-rules/naming-convention-boolean-prefix.js'
import noAdapterInUi from './eslint-rules/no-adapter-in-ui.js'
import noAndOrInNames from './eslint-rules/no-and-or-in-names.js'
import noCallExpressionInJsxProps from './eslint-rules/no-call-expression-in-jsx-props.js'
import noComplexInlineArguments from './eslint-rules/no-complex-inline-arguments.js'
import noComplexJsxInConditionals from './eslint-rules/no-complex-jsx-in-conditionals.js'
import noConsecutiveDuplicateReturns from './eslint-rules/no-consecutive-duplicate-returns.js'
import noCrossLayerImports from './eslint-rules/no-cross-layer-imports.js'
import noDataBuildersInProduction from './eslint-rules/no-data-builders-in-production.js'
import noDateNow from './eslint-rules/no-date-now.js'
import noElseIf from './eslint-rules/no-else-if.js'
import noEntireStateSelector from './eslint-rules/no-entire-state-selector.js'
import noEnumValueAsStringLiteral from './eslint-rules/no-enum-value-as-string-literal.js'
import noGenericResultVariable from './eslint-rules/no-generic-result-variable.js'
import noIPrefixInImports from './eslint-rules/no-i-prefix-in-imports.js'
import noIconSizeMagicNumbers from './eslint-rules/no-icon-size-magic-numbers.js'
import noIndexInCore from './eslint-rules/no-index-in-core.js'
import noInlineImportType from './eslint-rules/no-inline-import-type.js'
import noInlineObjectType from './eslint-rules/no-inline-object-type.js'
import noLameNaming from './eslint-rules/no-lame-naming.js'
import noModuleLevelConstants from './eslint-rules/no-module-level-constants.js'
import noNestedCallExpressions from './eslint-rules/no-nested-call-expressions.js'
import noNewInTestBody from './eslint-rules/no-new-in-test-body.js'
import noRedundantNullishTernary from './eslint-rules/no-redundant-nullish-ternary.js'
import noRedundantPropSpreading from './eslint-rules/no-redundant-prop-spreading.js'
import noSelectorPropDrilling from './eslint-rules/no-selector-prop-drilling.js'
import noStylesheetMagicNumbers from './eslint-rules/no-stylesheet-magic-numbers.js'
import noSwitch from './eslint-rules/no-switch.js'
import noTernaryFalseFallback from './eslint-rules/no-ternary-false-fallback.js'
import noThunkResultInComponent from './eslint-rules/no-thunk-result-in-component.js'
import noTryCatchInCore from './eslint-rules/no-try-catch-in-core.js'
import noUnusedTestId from './eslint-rules/no-unused-test-id.js'
import noUnwrap from './eslint-rules/no-unwrap.js'
import noUsecallbackSelectorWrapper from './eslint-rules/no-usecallback-selector-wrapper.js'
import objectShorthand from './eslint-rules/object-shorthand.js'
import oneComponentPerFile from './eslint-rules/one-component-per-file.js'
import oneListenerPerFile from './eslint-rules/one-listener-per-file.js'
import oneSelectorPerFile from './eslint-rules/one-selector-per-file.js'
import oneUsecasePerFile from './eslint-rules/one-usecase-per-file.js'
import oneViewModelPerFile from './eslint-rules/one-view-model-per-file.js'
import paddingLineBetweenBlockLike from './eslint-rules/padding-line-between-block-like.js'
import preferArrayDestructuring from './eslint-rules/prefer-array-destructuring.js'
import preferEnumOverStringUnion from './eslint-rules/prefer-enum-over-string-union.js'
import preferExtractedComponent from './eslint-rules/prefer-extracted-component.js'
import preferExtractedLongParams from './eslint-rules/prefer-extracted-long-params.js'
import preferInlineVariable from './eslint-rules/prefer-inline-variable.js'
import preferJumpTable from './eslint-rules/prefer-jump-table.js'
import preferNamedSelector from './eslint-rules/prefer-named-selector.js'
import preferObjectDestructuring from './eslint-rules/prefer-object-destructuring.js'
import preferParameterizedTest from './eslint-rules/prefer-parameterized-test.js'
import preferShortCircuitJsx from './eslint-rules/prefer-short-circuit-jsx.js'
import preferTernaryJsx from './eslint-rules/prefer-ternary-jsx.js'
import preferTernaryReturn from './eslint-rules/prefer-ternary-return.js'
import reactPropsDestructuring from './eslint-rules/react-props-destructuring.js'
import reducerInDomainFolder from './eslint-rules/reducer-in-domain-folder.js'
import repositoryImplementationNaming from './eslint-rules/repository-implementation-naming.js'
import requireColocatedTest from './eslint-rules/require-colocated-test.js'
import requireFeatureFlagDestructuring from './eslint-rules/require-feature-flag-destructuring.js'
import requireLoggerInCatch from './eslint-rules/require-logger-in-catch.js'
import requireNamedRegex from './eslint-rules/require-named-regex.js'
import requireTypedEach from './eslint-rules/require-typed-each.js'
import schemaMatchesFilename from './eslint-rules/schema-matches-filename.js'
import selectorMatchesFilename from './eslint-rules/selector-matches-filename.js'
import selectorStateFirstParam from './eslint-rules/selector-state-first-param.js'
import sliceMatchesFolder from './eslint-rules/slice-matches-folder.js'
import timeConstantMultiplication from './eslint-rules/time-constant-multiplication.js'
import tryCatchIsolation from './eslint-rules/try-catch-isolation.js'
import useDataBuilders from './eslint-rules/use-data-builders.js'
import usecaseMatchesFilename from './eslint-rules/usecase-matches-filename.js'
import viewModelMatchesFilename from './eslint-rules/view-model-matches-filename.js'

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
