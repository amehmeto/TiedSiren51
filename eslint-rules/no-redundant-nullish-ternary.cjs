/**
 * @fileoverview Disallow redundant nullish ternaries that guard function calls
 * @author TiedSiren
 *
 * Flags ternary expressions where the condition checks if a variable is
 * truthy, the consequent calls a function passing that variable, and the
 * alternate is a default falsy value. The function should handle
 * null/undefined inputs instead.
 *
 * BAD:
 *   const isLocked = lockedSirens ? isSirenLocked(lockedSirens, type, id) : false
 *
 * GOOD:
 *   const isLocked = isSirenLocked(lockedSirens, type, id)
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow redundant nullish ternaries that guard function calls',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noRedundantNullishTernary:
        'Redundant nullish ternary: "{{ functionName }}" should handle null/undefined inputs instead of the caller guarding with a ternary.',
    },
    schema: [],
  },

  create(context) {
    /**
     * Check if a node is a default falsy value:
     * false, null, undefined, 0, "", or []
     */
    function isDefaultFalsyValue(node) {
      const { type, value, name, elements } = node

      if (type === 'Literal')
        return value === false || value === null || value === 0 || value === ''

      if (type === 'Identifier' && name === 'undefined') return true

      if (type === 'ArrayExpression' && elements.length === 0) return true

      return false
    }

    /**
     * Get the function name from a CallExpression for reporting
     */
    function getFunctionName(callNode) {
      if (callNode.callee.type === 'Identifier') return callNode.callee.name

      if (
        callNode.callee.type === 'MemberExpression' &&
        callNode.callee.property.type === 'Identifier'
      )
        return callNode.callee.property.name

      return 'function'
    }

    return {
      ConditionalExpression(node) {
        const { test, consequent, alternate } = node

        if (test.type !== 'Identifier') return

        if (consequent.type !== 'CallExpression') return

        if (!isDefaultFalsyValue(alternate)) return

        const hasGuardedArg = consequent.arguments.some(
          (arg) => arg.type === 'Identifier' && arg.name === test.name,
        )
        if (!hasGuardedArg) return

        context.report({
          node,
          messageId: 'noRedundantNullishTernary',
          data: { functionName: getFunctionName(consequent) },
        })
      },
    }
  },
}
