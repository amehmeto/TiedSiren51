/**
 * @fileoverview Enforce hexagonal architecture layer boundaries
 * @author TiedSiren
 *
 * Ensures clean architecture layering:
 * - core/ cannot import from infra/ or ui/
 * - infra/ cannot import from ui/
 * - ui/ can import from both core/ and infra/ (it's the composition root)
 *
 * Test files and fixtures are excluded because test composition
 * (like UI layer) needs to wire up all layers.
 */

const path = require('path')

// Check if file is a test or fixture (allowed to break boundaries)
function isTestOrFixture(filename) {
  const basename = path.basename(filename)
  return (
    basename.endsWith('.test.ts') ||
    basename.endsWith('.spec.ts') ||
    basename.endsWith('.fixture.ts') ||
    filename.includes('/_tests_/')
  )
}

// Determine which layer a file belongs to
function getLayer(filename) {
  if (filename.includes('/core/')) return 'core'
  if (filename.includes('/infra/')) return 'infra'
  if (filename.includes('/ui/')) return 'ui'
  return null
}

// Determine which layer an import targets
function getImportLayer(importPath) {
  // Handle path aliases like @core/, @infra/, @ui/
  if (importPath.startsWith('@core/') || importPath.startsWith('@core')) return 'core'
  if (importPath.startsWith('@infra/') || importPath.startsWith('@infra')) return 'infra'
  if (importPath.startsWith('@ui/') || importPath.startsWith('@ui')) return 'ui'

  // Handle relative imports
  if (importPath.includes('/core/')) return 'core'
  if (importPath.includes('/infra/')) return 'infra'
  if (importPath.includes('/ui/')) return 'ui'

  return null
}

// Define forbidden imports per layer
const FORBIDDEN_IMPORTS = {
  core: ['infra', 'ui'], // core cannot import from infra or ui
  infra: ['ui'], // infra cannot import from ui
  ui: [], // ui can import from anywhere
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce hexagonal architecture layer boundaries',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      forbiddenImport:
        'Layer "{{fromLayer}}" cannot import from "{{toLayer}}". This violates hexagonal architecture boundaries.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Skip test files and fixtures (they're allowed to compose layers)
    if (isTestOrFixture(filename)) return {}

    const currentLayer = getLayer(filename)

    // Skip files not in a recognized layer
    if (!currentLayer) return {}

    const forbidden = FORBIDDEN_IMPORTS[currentLayer]

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const importLayer = getImportLayer(importPath)

        if (importLayer && forbidden.includes(importLayer)) {
          context.report({
            node,
            messageId: 'forbiddenImport',
            data: {
              fromLayer: currentLayer,
              toLayer: importLayer,
            },
          })
        }
      },

      // Check dynamic imports (import() expressions)
      ImportExpression(node) {
        if (node.source && node.source.type === 'Literal') {
          const importPath = node.source.value
          const importLayer = getImportLayer(importPath)

          if (importLayer && forbidden.includes(importLayer)) {
            context.report({
              node,
              messageId: 'forbiddenImport',
              data: {
                fromLayer: currentLayer,
                toLayer: importLayer,
              },
            })
          }
        }
      },
    }
  },
}
