/**
 * @fileoverview Enforce one use case per file in usecase directories
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce one use case per file in usecase directories',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleUseCases:
        'Only one use case is allowed per file. Found {{count}} use cases: {{useCases}}. Please split them into separate files.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply this rule to files in a 'usecases' directory
    if (!filename.includes('/usecases/')) {
      return {}
    }

    const useCases = []

    return {
      Program(node) {
        // Collect all exported declarations
        node.body.forEach((statement) => {
          let useCaseName = null

          // Handle: export const startTimer = createAppAsyncThunk(...)
          // Handle: export const loadData = async () => { ... }
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'VariableDeclaration'
          ) {
            statement.declaration.declarations.forEach((declarator) => {
              if (declarator.id.type === 'Identifier') {
                const name = declarator.id.name
                // Exclude types and test fixtures
                if (
                  !name.endsWith('Type') &&
                  !name.endsWith('Payload') &&
                  !name.endsWith('Result') &&
                  !name.endsWith('Response') &&
                  !name.endsWith('Request')
                ) {
                  useCaseName = name
                }
              }
            })
          }

          // Handle: export function loadData() { ... }
          // Handle: export async function loadData() { ... }
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'FunctionDeclaration'
          ) {
            useCaseName = statement.declaration.id?.name
          }

          // Handle: const loadData = ...; export { loadData };
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.specifiers?.length > 0
          ) {
            statement.specifiers.forEach((specifier) => {
              if (specifier.type === 'ExportSpecifier') {
                const name = specifier.exported.name
                // Exclude types
                if (
                  !name.endsWith('Type') &&
                  !name.endsWith('Payload') &&
                  !name.endsWith('Result') &&
                  !name.endsWith('Response') &&
                  !name.endsWith('Request')
                ) {
                  useCaseName = name
                }
              }
            })
          }

          if (useCaseName) {
            useCases.push(useCaseName)
          }
        })
      },

      'Program:exit'(node) {
        if (useCases.length > 1) {
          context.report({
            node,
            messageId: 'multipleUseCases',
            data: {
              count: useCases.length,
              useCases: useCases.join(', '),
            },
          })
        }
      },
    }
  },
}
