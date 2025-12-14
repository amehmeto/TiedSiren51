/**
 * @fileoverview Ensure schema files export a schema matching their filename
 * @author TiedSiren
 *
 * Schema files named "block-session.schema.ts" must export "blockSessionSchema".
 * The filename uses kebab-case, the export uses camelCase + "Schema".
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
      description: 'Ensure schema files export a schema matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Schema file "{{filename}}" must export "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    // Only check kebab-case.schema.ts files (not tests)
    const schemaMatch = basename.match(/^([a-z][a-z0-9-]*)\\.schema\\.ts$/)
    if (!schemaMatch) return {}

    // Skip test files
    if (basename.includes('.test.') || basename.includes('.spec.')) return {}

    const kebabName = schemaMatch[1]
    const expectedSchemaName = kebabToCamel(kebabName) + 'Schema'
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const xSchema = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
        }
        // export { xSchema }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected schema name was exported
        if (!foundExports.includes(expectedSchemaName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedSchemaName,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
