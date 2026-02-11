/**
 * @fileoverview Disallow index.ts barrel files in core/ directory
 * @author TiedSiren
 *
 * Barrel files (index.ts) can hide dependencies and make it harder to understand
 * the actual imports. In the core layer, we want explicit imports for better
 * traceability and to avoid circular dependencies.
 */

import path from 'path'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow index.ts barrel files in core/ directory',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noIndexInCore:
        'Barrel files (index.ts) are not allowed in core/. Use explicit imports instead. Found: "{{filename}}"',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const basename = path.basename(filename)

    return {
      Program(node) {
        // Check if we're in core/ directory
        if (!filename.includes('/core/')) return

        // Check if this is an index file
        if (basename === 'index.ts' || basename === 'index.tsx') {
          context.report({
            node,
            messageId: 'noIndexInCore',
            data: { filename: basename },
          })
        }
      },
    }
  },
}
