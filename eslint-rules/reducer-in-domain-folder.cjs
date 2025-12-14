/**
 * @fileoverview Ensure reducer.ts files are in domain folders within core/
 * @author TiedSiren
 *
 * Reducer files should be located directly in a domain folder like:
 * - core/auth/reducer.ts ✓
 * - core/blocklist/reducer.ts ✓
 * - core/reducer.ts ✗ (not in a domain folder)
 * - infra/auth/reducer.ts ✗ (not in core/)
 */

const path = require('path')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure reducer.ts files are in domain folders within core/',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      wrongLocation:
        'Reducer file "{{filename}}" should be in a domain folder within core/ (e.g., core/auth/reducer.ts). Current location: {{location}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    // Only check reducer.ts files
    if (basename !== 'reducer.ts') return {}

    return {
      Program(node) {
        // Must be in core/
        if (!filename.includes('/core/')) {
          context.report({
            node,
            messageId: 'wrongLocation',
            data: {
              filename: basename,
              location: filename,
            },
          })
          return
        }

        // Get path after /core/
        const coreIndex = filename.indexOf('/core/')
        const pathAfterCore = filename.slice(coreIndex + 6) // +6 for '/core/'
        const parts = pathAfterCore.split('/')

        // Should be exactly domain/reducer.ts (2 parts)
        // e.g., ['auth', 'reducer.ts']
        if (parts.length !== 2) {
          context.report({
            node,
            messageId: 'wrongLocation',
            data: {
              filename: basename,
              location: filename,
            },
          })
        }
      },
    }
  },
}
