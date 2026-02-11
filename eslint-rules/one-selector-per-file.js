/**
 * @fileoverview Enforce one selector per file in selector directories
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce one selector per file in selector directories',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleSelectors:
        'Only one selector is allowed per file. Found {{count}} selectors: {{selectors}}. Please split them into separate files.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply this rule to files in a 'selectors' directory
    if (!filename.includes('/selectors/')) return {}

    const selectors = []

    return {
      Program(node) {
        // Collect all exported declarations
        node.body.forEach((statement) => {
          // Handle: export const selectFoo = ...
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'VariableDeclaration'
          ) {
            statement.declaration.declarations.forEach((declarator) => {
              declarator.id.type === 'Identifier' &&
                declarator.id.name.startsWith('select') &&
                selectors.push(declarator.id.name)
            })
          }

          // Handle: export function selectFoo() { ... }
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'FunctionDeclaration'
          ) {
            const funcName = statement.declaration.id?.name
            funcName?.startsWith('select') && selectors.push(funcName)
          }

          // Handle: const selectFoo = ...; export { selectFoo };
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.specifiers?.length > 0
          ) {
            statement.specifiers.forEach((specifier) => {
              specifier.type === 'ExportSpecifier' &&
                specifier.exported.name.startsWith('select') &&
                selectors.push(specifier.exported.name)
            })
          }
        })
      },

      'Program:exit'(node) {
        if (selectors.length > 1) {
          context.report({
            node,
            messageId: 'multipleSelectors',
            data: {
              count: selectors.length,
              selectors: selectors.join(', '),
            },
          })
        }
      },
    }
  },
}
