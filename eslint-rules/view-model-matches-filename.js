/**
 * @fileoverview Ensure view-model files export a selector matching their filename
 * @author TiedSiren
 *
 * View-model files named "home.view-model.ts" must export "selectHomeViewModel".
 * The filename uses kebab-case, the export uses "select" + PascalCase + "ViewModel".
 */

import path from 'path'

// Convert kebab-case to PascalCase
function kebabToPascal(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure view-model files export a selector matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'View-model file "{{filename}}" must export a function named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    // Only check kebab-case.view-model.ts files (not tests)
    const viewModelMatch = basename.match(/^([a-z][a-z0-9-]*)\.view-model\.ts$/)
    if (!viewModelMatch) return {}

    const kebabName = viewModelMatch[1]
    const expectedViewModelName =
      'select' + kebabToPascal(kebabName) + 'ViewModel'
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const selectXViewModel = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function selectXViewModel() { ... }
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { selectXViewModel }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected view-model name was exported
        if (!foundExports.includes(expectedViewModelName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedViewModelName,
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
