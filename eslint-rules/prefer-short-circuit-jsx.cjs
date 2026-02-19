/**
 * @fileoverview Prefer short-circuit (&&) over ternary with null for conditional JSX rendering
 *
 * Detects patterns like:
 *   {condition ? <Component /> : null}
 *
 * And suggests:
 *   {condition && <Component />}
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer short-circuit (&&) over ternary with null for conditional JSX rendering',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      preferShortCircuit:
        'Use `{{condition}} && <JSX />` instead of `{{condition}} ? <JSX /> : null`.',
    },
    schema: [],
  },

  create(context) {
    function isNullLiteral(node) {
      return node.type === 'Literal' && node.value === null
    }

    function isJSXNode(node) {
      return node.type === 'JSXElement' || node.type === 'JSXFragment'
    }

    function needsParens(node) {
      return (
        node.type === 'LogicalExpression' ||
        node.type === 'BinaryExpression' ||
        node.type === 'ConditionalExpression' ||
        node.type === 'AssignmentExpression' ||
        node.type === 'SequenceExpression'
      )
    }

    return {
      ConditionalExpression(node) {
        // Only check inside JSX expression containers
        if (
          node.parent.type !== 'JSXExpressionContainer' &&
          node.parent.type !== 'ReturnStatement' &&
          node.parent.type !== 'VariableDeclarator' &&
          node.parent.type !== 'AssignmentExpression'
        )
          return

        const { test, consequent, alternate } = node

        // Pattern: condition ? <JSX /> : null
        if (isJSXNode(consequent) && isNullLiteral(alternate)) {
          const sourceCode = context.getSourceCode()
          const rawCondition = sourceCode.getText(test)
          const conditionText = needsParens(test)
            ? `(${rawCondition})`
            : rawCondition

          context.report({
            node,
            messageId: 'preferShortCircuit',
            data: { condition: rawCondition },
            fix(fixer) {
              const consequentText = sourceCode.getText(consequent)
              return fixer.replaceText(
                node,
                `${conditionText} && (${consequentText})`,
              )
            },
          })
        }
      },
    }
  },
}
