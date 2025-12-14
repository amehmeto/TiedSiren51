/**
 * @fileoverview Ensure gateway implementations follow naming convention
 * @author TiedSiren
 *
 * Gateway files like "firebase.auth.gateway.ts" must export a class named
 * "FirebaseAuthGateway" - PascalCase of prefix + domain + Gateway.
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
      description: 'Ensure gateway implementations follow naming convention',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Gateway file "{{filename}}" must export a class named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to files in infra/
    if (!filename.includes('/infra/')) return {}

    const basename = path.basename(filename)

    // Only check prefix.domain.gateway.ts files (not tests)
    const gatewayMatch = basename.match(/^([a-z][a-z0-9-]*)\\.([a-z][a-z0-9-]*)\\.gateway\\.ts$/)
    if (!gatewayMatch) return {}

    // Skip test files
    if (basename.includes('.test.') || basename.includes('.spec.')) return {}

    const prefix = gatewayMatch[1]
    const domain = gatewayMatch[2]

    // Expected: FirebaseAuthGateway
    const expectedClassName = kebabToPascal(prefix) + kebabToPascal(domain) + 'Gateway'
    const foundExports = []

    return {
      // Track class exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export class XGateway { ... }
          if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { XGateway }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected class name was exported
        if (!foundExports.includes(expectedClassName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedClassName,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
