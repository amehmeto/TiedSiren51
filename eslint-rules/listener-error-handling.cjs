/**
 * @fileoverview Enforce error handling in listener files.
 * Listeners run in response to state changes and should handle errors gracefully
 * to prevent crashes. They should use try-catch or call safe* prefixed functions.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that listener files have proper error handling via try-catch or safe* functions',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingErrorHandling:
        'Listener functions should have error handling. Use try-catch blocks or call safe* prefixed helper functions to handle potential errors gracefully.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to */listeners/*.ts files, excluding tests
    if (!filename.includes('/listeners/')) return {}
    if (filename.includes('.test.ts')) return {}
    if (filename.includes('.spec.ts')) return {}

    let hasTryCatch = false
    let hasSafeCall = false

    return {
      TryStatement() {
        hasTryCatch = true
      },

      CallExpression(node) {
        // Check for calls to safe* prefixed functions
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name.startsWith('safe')
        ) {
          hasSafeCall = true
        }

        // Also check method calls like this.safeMethod()
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name.startsWith('safe')
        ) {
          hasSafeCall = true
        }
      },

      'Program:exit'(node) {
        // If neither try-catch nor safe* calls found, report on the program
        if (!hasTryCatch && !hasSafeCall) {
          context.report({
            node,
            messageId: 'missingErrorHandling',
          })
        }
      },
    }
  },
}
