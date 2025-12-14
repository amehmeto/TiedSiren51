/**
 * @fileoverview Ensure listener files export a function matching their filename
 * @author TiedSiren
 *
 * Listener files named "on-user-logged-in.listener.ts" must export "onUserLoggedInListener".
 * The filename uses kebab-case, the export uses camelCase + "Listener" suffix.
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
      description: 'Ensure listener files export a function matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Listener file "{{filename}}" must export a function named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to listener files
    if (!filename.includes('/listeners/')) return {}

    const basename = path.basename(filename)

    // Only check kebab-case.listener.ts files (not tests)
    const listenerMatch = basename.match(/^([a-z][a-z0-9-]*)\\.listener\\.ts$/)
    if (!listenerMatch) return {}

    const kebabName = listenerMatch[1]
    const expectedListenerName = kebabToCamel(kebabName) + 'Listener'
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const onXListener = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function onXListener() { ... }
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { onXListener }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected listener name was exported
        if (!foundExports.includes(expectedListenerName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedListenerName,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
