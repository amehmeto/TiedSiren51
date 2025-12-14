/**
 * @fileoverview Ensure slice files export a slice matching their folder name
 * @author TiedSiren
 *
 * Slice files in "core/blocklist/blocklist.slice.ts" must export "blocklistSlice".
 * The folder name determines the expected slice name.
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
      description: 'Ensure slice files export a slice matching their folder name',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Slice file "{{filename}}" must export "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to files in core/
    if (!filename.includes('/core/')) return {}

    const basename = path.basename(filename)

    // Only check .slice.ts files
    if (!basename.endsWith('.slice.ts')) return {}

    // Get the parent folder name (the domain)
    const dirname = path.dirname(filename)
    const folderName = path.basename(dirname)

    // Expected: blocklistSlice from blocklist folder
    const expectedSliceName = kebabToCamel(folderName) + 'Slice'
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const xSlice = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
        }
        // export { xSlice }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected slice name was exported
        if (!foundExports.includes(expectedSliceName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedSliceName,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
