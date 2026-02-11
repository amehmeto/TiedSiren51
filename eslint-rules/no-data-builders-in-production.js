/**
 * @fileoverview Prevent data builders from being used in production code.
 * Data builders (build*) should only be called from test files, fixture files,
 * or other data builder files.
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent data builders from being used in production code (SUT files)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noDataBuilderInProduction:
        '{{ builderName }}() is a data builder and should only be used in test files (*.test.ts, *.spec.ts), fixture files (*.fixture.ts), or other data builders. Remove it from production code.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Allow in test files
    if (filename.includes('.test.ts') || filename.includes('.test.tsx')) {
      return {}
    }

    // Allow in spec files
    if (filename.includes('.spec.ts') || filename.includes('.spec.tsx')) {
      return {}
    }

    // Allow in fixture files
    if (filename.includes('.fixture.ts') || filename.includes('.fixture.tsx')) {
      return {}
    }

    // Allow in data builder files
    if (filename.includes('.builder.ts') || filename.includes('.builder.tsx')) {
      return {}
    }

    // Allow in _tests_ directory (test utilities, createTestStore, etc.)
    if (filename.includes('/_tests_/') || filename.includes('\\_tests_\\')) {
      return {}
    }

    return {
      CallExpression(node) {
        // Check if it's a function call with name starting with 'build'
        if (node.callee.type === 'Identifier') {
          const funcName = node.callee.name
          if (funcName.startsWith('build')) {
            context.report({
              node,
              messageId: 'noDataBuilderInProduction',
              data: {
                builderName: funcName,
              },
            })
          }
        }
      },

      // Also check imports to catch early
      ImportDeclaration(node) {
        const source = node.source.value

        // Check if importing from data-builders directory or .builder files
        // Use stricter matching to avoid false positives:
        // - data-builders must be a path segment (preceded by / or start of string)
        // - .builder must be at end of import path (the file extension prefix)
        const isDataBuildersImport =
          source.includes('/data-builders/') ||
          source.startsWith('data-builders/') ||
          source === 'data-builders'
        const isBuilderFileImport = source.endsWith('.builder')

        if (isDataBuildersImport || isBuilderFileImport) {
          // Check each imported specifier
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              const importedName =
                specifier.imported.name || specifier.imported.value
              if (importedName.startsWith('build')) {
                context.report({
                  node: specifier,
                  messageId: 'noDataBuilderInProduction',
                  data: {
                    builderName: importedName,
                  },
                })
              }
            }
          })
        }
      },
    }
  },
}
