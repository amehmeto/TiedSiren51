/**
 * @fileoverview Ensure selector files export a function matching their filename
 * @author TiedSiren
 *
 * Selector files named "selectSomething.ts" must export a function named "selectSomething".
 * This ensures consistency between filename and the exported selector function.
 */

import path from 'path'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure selector files export a function matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Selector file "{{filename}}" must export a function named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to selector files in core/*/selectors/
    if (!filename.includes('/selectors/') || !filename.includes('/core/'))
      return {}

    const basename = path.basename(filename)

    // Only check selectCamelCase.ts files (not view-models or test files)
    const selectorMatch = basename.match(/^(select[A-Z][a-zA-Z0-9]*)\.ts$/)
    if (!selectorMatch) return {}

    const expectedSelectorName = selectorMatch[1]
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const selectX = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function selectX() { ... }
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { selectX }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected selector name was exported
        if (!foundExports.includes(expectedSelectorName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedSelectorName,
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
