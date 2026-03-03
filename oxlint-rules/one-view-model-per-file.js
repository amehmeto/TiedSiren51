/**
 * @fileoverview Enforce one view-model export per file
 * @author TiedSiren
 *
 * Similar to one-selector-per-file and one-usecase-per-file, this ensures
 * view-model files export only one view-model selector to maintain single responsibility.
 */

import path from 'path'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce one view-model export per file',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleViewModels:
        'View-model file "{{filename}}" should export only one view-model selector. Found {{count}}: {{viewModels}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    // Skip test files
    if (basename.endsWith('.test.ts') || basename.endsWith('.spec.ts'))
      return {}

    // Only check .view-model.ts files
    if (!basename.endsWith('.view-model.ts')) return {}

    const viewModelExports = []

    return {
      // Track named exports that look like view-model selectors
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const selectXViewModel = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (
                decl.id &&
                decl.id.name &&
                decl.id.name.includes('ViewModel')
              ) {
                viewModelExports.push(decl.id.name)
              }
            })
          }
          // export function selectXViewModel() { ... }
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id &&
            node.declaration.id.name.includes('ViewModel')
          ) {
            viewModelExports.push(node.declaration.id.name)
          }
        }
        // export { selectXViewModel }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (
              spec.exported &&
              spec.exported.name &&
              spec.exported.name.includes('ViewModel')
            ) {
              viewModelExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        if (viewModelExports.length > 1) {
          context.report({
            node,
            messageId: 'multipleViewModels',
            data: {
              filename: basename,
              count: viewModelExports.length,
              viewModels: viewModelExports.join(', '),
            },
          })
        }
      },
    }
  },
}
