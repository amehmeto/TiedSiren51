/**
 * @fileoverview Enforce time constants to always have an explicit multiplier for readability
 * @author TiedSiren
 *
 * This rule ensures that time constants (SECOND, MINUTE, HOUR, DAY) are always
 * preceded by a numeric multiplier for better readability.
 *
 * Bad:  HOUR + MINUTE * 30
 * Good: 1 * HOUR + 30 * MINUTE
 */

const TIME_CONSTANTS = ['MILLISECOND', 'SECOND', 'MINUTE', 'HOUR', 'DAY']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce time constants to have explicit numeric multiplier (e.g., 1 * HOUR instead of HOUR)',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      missingMultiplier:
        'Time constant "{{name}}" should have an explicit multiplier (e.g., 1 * {{name}}).',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    function isTimeConstant(node) {
      return (
        node.type === 'Identifier' && TIME_CONSTANTS.includes(node.name)
      )
    }

    function isPartOfMultiplication(node) {
      const parent = node.parent

      if (parent.type === 'BinaryExpression' && parent.operator === '*') {
        // Only accept when the time constant is on the right side of multiplication
        // e.g., 30 * MINUTE or minutes * MINUTE (MINUTE is on the right)
        // MINUTE * 30 is NOT accepted - multiplier should come first
        if (parent.right === node) return true
      }

      return false
    }

    function isRightSideOfDivision(node) {
      const parent = node.parent
      return (
        parent.type === 'BinaryExpression' &&
        parent.operator === '/' &&
        parent.right === node
      )
    }

    function isLeftSideOfMultiplication(node) {
      const parent = node.parent
      return (
        parent.type === 'BinaryExpression' &&
        parent.operator === '*' &&
        parent.left === node
      )
    }

    return {
      Identifier(node) {
        if (!isTimeConstant(node)) return

        // Skip if it's part of an import declaration
        if (
          node.parent.type === 'ImportSpecifier' ||
          node.parent.type === 'ImportDefaultSpecifier'
        )
          return

        // Skip if it's the left side of a variable declaration (defining the constant)
        if (
          node.parent.type === 'VariableDeclarator' &&
          node.parent.id === node
        )
          return

        // Skip if it's a property access (e.g., obj.HOUR)
        if (
          node.parent.type === 'MemberExpression' &&
          node.parent.property === node
        )
          return

        // Check if this constant is already part of a multiplication (on the right side)
        if (isPartOfMultiplication(node)) return

        context.report({
          node,
          messageId: 'missingMultiplier',
          data: {
            name: node.name,
          },
          fix(fixer) {
            // Use parentheses when inside division: ms / SECOND -> ms / (1 * SECOND)
            if (isRightSideOfDivision(node))
              return fixer.replaceText(node, `(1 * ${node.name})`)

            // Swap order when on left side: MINUTE * 30 -> 30 * MINUTE
            if (isLeftSideOfMultiplication(node)) {
              const parent = node.parent
              const rightText = sourceCode.getText(parent.right)
              return fixer.replaceText(parent, `${rightText} * ${node.name}`)
            }

            return fixer.replaceText(node, `1 * ${node.name}`)
          },
        })
      },
    }
  },
}
