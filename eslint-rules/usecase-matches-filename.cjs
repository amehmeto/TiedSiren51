/**
 * @fileoverview Ensure usecase files export a thunk matching their filename
 * @author TiedSiren
 *
 * Usecase files named "do-something.usecase.ts" must export a thunk named "doSomething".
 * The filename uses kebab-case, the export uses camelCase.
 */

const path = require('path')

// Convert kebab-case to camelCase
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure usecase files export a thunk matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Usecase file "{{filename}}" must export a thunk named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to usecase files in core/*/usecases/
    if (!filename.includes('/usecases/') || !filename.includes('/core/')) return {}

    const basename = path.basename(filename)

    // Only check kebab-case.usecase.ts files (not fixtures or tests)
    const usecaseMatch = basename.match(/^([a-z][a-z0-9-]*)\.usecase\.ts$/)
    if (!usecaseMatch) return {}

    const kebabName = usecaseMatch[1]
    const expectedUsecaseName = kebabToCamel(kebabName)
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const doSomething = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function doSomething() { ... }
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { doSomething }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected usecase name was exported
        if (!foundExports.includes(expectedUsecaseName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedUsecaseName,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
