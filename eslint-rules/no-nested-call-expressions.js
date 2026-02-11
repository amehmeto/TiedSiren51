/**
 * @fileoverview Disallow nested function calls as arguments
 * Nested calls like `a(b(x))` should be extracted to variables for readability.
 * @author TiedSiren
 */

export default {
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
          allowNoArguments: {
            type: 'boolean',
            description:
              'Allow nested calls when inner call has no arguments (e.g., getState())',
            default: false,
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
    const allowNoArguments = options.allowNoArguments || false

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

    // Idiomatic patterns that are always allowed (outer call)
    const alwaysAllowedOuter = ['dispatch']

    function isAllowed(name) {
      return allowedPatterns.some((pattern) => pattern.test(name))
    }

    function isAlwaysAllowedOuter(name) {
      return alwaysAllowedOuter.includes(name)
    }

    return {
      CallExpression(node) {
        const outerName = getCallName(node)
        if (isAllowed(outerName) || isAlwaysAllowedOuter(outerName)) return

        for (const arg of node.arguments) {
          if (arg.type === 'CallExpression') {
            const innerName = getCallName(arg)
            if (isAllowed(innerName)) continue

            // Allow nested calls with no arguments (e.g., getState())
            if (allowNoArguments && arg.arguments.length === 0) continue

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
