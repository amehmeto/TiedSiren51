/**
 * @fileoverview Require extracting call expressions from JSX props into variables
 * Complex expressions like `isSelected={checkSelected(item)}` should be extracted
 * to `const isSelected = checkSelected(item)` for better readability.
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require extracting call expressions with arguments from JSX props into variables',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      extractCallExpression:
        'Extract `{{call}}` to a variable before passing to JSX prop `{{prop}}`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNoArguments: {
            type: 'boolean',
            description: 'Allow call expressions without arguments (e.g., getValue())',
            default: true,
          },
          allowedFunctions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Function names that are allowed inline (e.g., t for i18n)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const allowNoArguments = options.allowNoArguments !== false
    const allowedFunctions = new Set(options.allowedFunctions || ['t', 'i18n'])

    function getCallName(node) {
      if (node.callee.type === 'Identifier') return node.callee.name

      if (node.callee.type === 'MemberExpression') {
        if (node.callee.property.type === 'Identifier')
          return node.callee.property.name

        return '...'
      }

      return '...'
    }

    function getCallText(node) {
      const name = getCallName(node)
      if (node.arguments.length === 0) return `${name}()`

      return `${name}(...)`
    }

    function isAllowedFunction(name) {
      return allowedFunctions.has(name)
    }

    return {
      JSXExpressionContainer(node) {
        // Only check JSX attributes (props), not children
        if (node.parent.type !== 'JSXAttribute') return

        const expression = node.expression

        // Skip empty expressions
        if (expression.type === 'JSXEmptyExpression') return

        // Check for direct call expressions
        if (expression.type === 'CallExpression') {
          const callName = getCallName(expression)

          // Allow whitelisted functions (like i18n's t())
          if (isAllowedFunction(callName)) return

          // Optionally allow calls without arguments
          if (allowNoArguments && expression.arguments.length === 0) return

          const propName = node.parent.name.name

          context.report({
            node: expression,
            messageId: 'extractCallExpression',
            data: {
              call: getCallText(expression),
              prop: propName,
            },
          })
        }
      },
    }
  },
}
