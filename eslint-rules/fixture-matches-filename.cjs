/**
 * @fileoverview Ensure fixture files export a function matching their filename
 * @author TiedSiren
 *
 * Fixture files named "auth.fixture.ts" must export "authFixture" or "createAuthFixture".
 * The filename uses kebab-case, the export uses camelCase + "Fixture" or "create" + PascalCase + "Fixture".
 */

const path = require('path')

// Convert kebab-case to camelCase
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

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
      description: 'Ensure fixture files export a function matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Fixture file "{{filename}}" must export a function named "{{expectedName1}}" or "{{expectedName2}}". Found exports: {{foundExports}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    // Only check kebab-case.fixture.ts files
    const fixtureMatch = basename.match(/^([a-z][a-z0-9-]*)\\.fixture\\.ts$/)
    if (!fixtureMatch) return {}

    const kebabName = fixtureMatch[1]
    // Accept both patterns: authFixture or createAuthFixture
    const expectedFixtureName1 = kebabToCamel(kebabName) + 'Fixture'
    const expectedFixtureName2 = 'create' + kebabToPascal(kebabName) + 'Fixture'
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const xFixture = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function xFixture() { ... }
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { xFixture }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if either expected fixture name was exported
        const hasExpectedExport =
          foundExports.includes(expectedFixtureName1) ||
          foundExports.includes(expectedFixtureName2)

        if (!hasExpectedExport) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName1: expectedFixtureName1,
              expectedName2: expectedFixtureName2,
              foundExports: foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
