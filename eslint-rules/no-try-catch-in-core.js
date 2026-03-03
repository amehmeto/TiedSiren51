/**
 * @fileoverview Forbid try-catch blocks in core business logic.
 * Core should be pure and deterministic - error handling belongs at boundaries (infra/listeners/UI).
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbid try-catch blocks in core business logic. Error handling should be at boundaries.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noTryCatchInCore:
        'Try-catch blocks are not allowed in core business logic. Handle errors at the boundaries (infra, listeners, UI) instead. Core should remain pure and testable.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to core/**/*.ts files, excluding tests and fixtures
    if (!filename.includes('/core/')) return {}
    if (filename.includes('.test.ts')) return {}
    if (filename.includes('.spec.ts')) return {}
    if (filename.includes('.fixture.ts')) return {}
    // Allow in listeners since they are at the boundary
    if (filename.includes('/listeners/')) return {}

    return {
      TryStatement(node) {
        context.report({
          node,
          messageId: 'noTryCatchInCore',
        })
      },
    }
  },
}
