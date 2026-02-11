/**
 * @fileoverview Ensure repository implementations follow naming convention
 * @author TiedSiren
 *
 * Repository files like "pouchdb.block-session.repository.ts" must export
 * a class named "PouchdbBlockSessionRepository" - PascalCase of prefix + domain + Repository.
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
      description: 'Ensure repository implementations follow naming convention',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Repository file "{{filename}}" must export a class named "{{expectedName}}". Found exports: {{foundExports}}',
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

    // Only check prefix.domain.repository.ts files (not tests)
    const repoMatch = basename.match(
      /^([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)\.repository\.ts$/,
    )
    if (!repoMatch) return {}

    // Skip test files
    if (basename.includes('.test.') || basename.includes('.spec.')) return {}

    const prefix = repoMatch[1]
    const domain = repoMatch[2]

    // Expected: PouchdbBlockSessionRepository
    const expectedClassName =
      kebabToPascal(prefix) + kebabToPascal(domain) + 'Repository'
    const foundExports = []

    return {
      // Track class exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export class XRepository { ... }
          if (
            node.declaration.type === 'ClassDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { XRepository }
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
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
