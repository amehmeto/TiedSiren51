/**
 * @fileoverview Ensure builder files export a function matching their filename
 * @author TiedSiren
 *
 * Builder files named "block-session.builder.ts" must export "buildBlockSession".
 * The filename uses kebab-case, the export uses "build" + PascalCase.
 */

const path = require('path')

// Convert kebab-case to PascalCase
function kebabToPascal(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure builder files export a function matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Builder file "{{filename}}" must export a function named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    // Only check kebab-case.builder.ts files
    const builderMatch = basename.match(/^([a-z][a-z0-9-]*)\\.builder\\.ts$/)
    if (!builderMatch) return {}

    const kebabName = builderMatch[1]
    const expectedBuilderName = 'build' + kebabToPascal(kebabName)
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const buildX = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function buildX() { ... }
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { buildX }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected builder name was exported
        if (!foundExports.includes(expectedBuilderName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedBuilderName,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
