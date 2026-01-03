/**
 * @fileoverview Disallow nested function calls as arguments
 * Nested calls like `a(b(x))` should be extracted to variables for readability.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested function calls as arguments',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noNestedCalls:
        'Avoid nested function calls. Extract `{{innerCall}}` to a variable first.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Patterns of function names to allow nesting',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const allowedPatterns = (options.allowedPatterns || []).map(
      (p) => new RegExp(p),
    )

    function getCallName(node) {
      if (node.callee.type === 'Identifier') return node.callee.name

      if (node.callee.type === 'MemberExpression') {
        // Return just the method name for matching against allowed patterns
        if (node.callee.property.type === 'Identifier')
          return node.callee.property.name

        return '...'
      }

      return '...'
    }

    function isAllowed(name) {
      return allowedPatterns.some((pattern) => pattern.test(name))
    }

    return {
      CallExpression(node) {
        const outerName = getCallName(node)
        if (isAllowed(outerName)) return

        for (const arg of node.arguments) {
          if (arg.type === 'CallExpression') {
            const innerName = getCallName(arg)
            if (isAllowed(innerName)) continue

            context.report({
              node: arg,
              messageId: 'noNestedCalls',
              data: { innerCall: `${innerName}(...)` },
            })
          }
        }
      },
    }
  },
}
