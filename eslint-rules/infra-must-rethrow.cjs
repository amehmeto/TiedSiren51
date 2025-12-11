/**
 * @fileoverview Enforce that infra catch blocks rethrow errors after logging.
 * Infra layer should log errors with context but rethrow them so callers can decide
 * how to handle them. The pattern is: log + rethrow.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that catch blocks in infra layer rethrow errors after logging',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      mustRethrow:
        'Catch blocks in infra must rethrow errors after logging. Use the pattern: logger.error(...); throw error; This allows callers to decide how to handle the failure.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to infra/**/*.ts files, excluding tests
    if (!filename.includes('/infra/')) return {}
    if (filename.includes('.test.ts')) return {}
    if (filename.includes('.spec.ts')) return {}

    return {
      CatchClause(node) {
        const body = node.body.body
        if (!body || body.length === 0) {
          context.report({
            node,
            messageId: 'mustRethrow',
          })
          return
        }

        // Check if the last statement is a throw
        const lastStatement = body[body.length - 1]
        const hasThrow = lastStatement.type === 'ThrowStatement'

        // Also check if there's a throw anywhere (for early throws)
        const hasAnyThrow = body.some((stmt) => stmt.type === 'ThrowStatement')

        // Check for return statements that might be returning the error result
        const hasReturn = body.some((stmt) => stmt.type === 'ReturnStatement')

        // Allow if:
        // 1. Has a throw statement (rethrow pattern)
        // 2. Has a return statement (returning error/fallback value - acceptable in some cases)
        if (!hasThrow && !hasAnyThrow && !hasReturn) {
          context.report({
            node,
            messageId: 'mustRethrow',
          })
        }
      },
    }
  },
}
