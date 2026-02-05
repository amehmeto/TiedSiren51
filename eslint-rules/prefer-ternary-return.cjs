/**
 * @fileoverview Prefer ternary over if-return followed by return
 *
 * Detects patterns like:
 *   if (condition) return a
 *   return b
 *
 * And suggests converting to:
 *   return condition ? a : b
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer ternary expressions over if-return followed by return',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      preferTernary:
        'Prefer ternary: `return {{condition}} ? {{consequent}} : {{alternate}}`',
    },
    schema: [
      {
        type: 'object',
        properties: {
          skipJsx: {
            type: 'boolean',
            description: 'Skip when return statements contain JSX elements.',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const skipJsx = options.skipJsx || false

    const sourceCode = context.getSourceCode()

    function getReturnStatement(node) {
      if (!node) return null
      if (node.type === 'ReturnStatement') return node
      if (
        node.type === 'BlockStatement' &&
        node.body.length === 1 &&
        node.body[0].type === 'ReturnStatement'
      ) {
        return node.body[0]
      }
      return null
    }

    function containsJsx(node) {
      if (!node) return false
      if (
        node.type === 'JSXElement' ||
        node.type === 'JSXFragment' ||
        node.type === 'JSXText'
      ) {
        return true
      }
      // Recursively check child nodes
      for (const key of Object.keys(node)) {
        if (key === 'parent') continue
        const child = node[key]
        if (Array.isArray(child)) {
          if (child.some((c) => c && typeof c === 'object' && containsJsx(c))) {
            return true
          }
        } else if (child && typeof child === 'object' && containsJsx(child)) {
          return true
        }
      }
      return false
    }

    function getExpressionText(node) {
      if (!node) return 'undefined'
      const text = sourceCode.getText(node)
      // Truncate long expressions
      return text.length > 30 ? text.slice(0, 27) + '...' : text
    }

    return {
      IfStatement(node) {
        // Must have no else clause
        if (node.alternate) return

        // Must have a simple return in the consequent
        const consequentReturn = getReturnStatement(node.consequent)
        if (!consequentReturn) return

        // Must be followed by a return statement in the same block
        const parent = node.parent
        if (parent.type !== 'BlockStatement') return

        const siblings = parent.body
        const index = siblings.indexOf(node)
        if (index === -1 || index >= siblings.length - 1) return

        const nextStatement = siblings[index + 1]
        if (nextStatement.type !== 'ReturnStatement') return

        // Skip if either return contains JSX and skipJsx is enabled
        if (skipJsx) {
          if (
            containsJsx(consequentReturn.argument) ||
            containsJsx(nextStatement.argument)
          ) {
            return
          }
        }

        // Skip if either return expression spans multiple lines (complex expressions)
        const consequentLines =
          consequentReturn.loc.end.line - consequentReturn.loc.start.line
        const alternateLines =
          nextStatement.loc.end.line - nextStatement.loc.start.line
        if (consequentLines > 0 || alternateLines > 0) return

        // Report the issue
        context.report({
          node,
          messageId: 'preferTernary',
          data: {
            condition: getExpressionText(node.test),
            consequent: getExpressionText(consequentReturn.argument),
            alternate: getExpressionText(nextStatement.argument),
          },
        })
      },
    }
  },
}
