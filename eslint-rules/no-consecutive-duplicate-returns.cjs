/**
 * @fileoverview Merge consecutive if-return statements with identical return values
 * @author TiedSiren
 *
 * Detects consecutive if-return statements that return the same value and
 * suggests combining them with ||.
 *
 * BAD:
 *   if (!a) return EMPTY
 *   if (!b) return EMPTY
 *
 * GOOD:
 *   if (!a || !b) return EMPTY
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Merge consecutive if-return statements with identical return values',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      mergeReturns:
        'Consecutive if-return statements return the same value. Merge conditions with `||`.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    function getReturnStatement(node) {
      if (!node) return null
      if (node.type === 'ReturnStatement') return node
      if (
        node.type === 'BlockStatement' &&
        node.body.length === 1 &&
        node.body[0].type === 'ReturnStatement'
      )
        return node.body[0]
      return null
    }

    function getReturnText(returnNode) {
      return returnNode.argument
        ? sourceCode.getText(returnNode.argument)
        : 'undefined'
    }

    return {
      IfStatement(node) {
        if (node.alternate) return

        const consequentReturn = getReturnStatement(node.consequent)
        if (!consequentReturn) return

        const { parent } = node
        if (parent.type !== 'BlockStatement') return

        const { body: siblings } = parent
        const index = siblings.indexOf(node)
        if (index <= 0) return

        const { type, alternate, consequent } = siblings[index - 1]
        if (type !== 'IfStatement' || alternate) return

        const prevReturn = getReturnStatement(consequent)
        if (!prevReturn) return

        const currentReturnText = getReturnText(consequentReturn)
        const prevReturnText = getReturnText(prevReturn)

        if (currentReturnText !== prevReturnText) return

        context.report({
          node,
          messageId: 'mergeReturns',
        })
      },
    }
  },
}
