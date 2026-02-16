/**
 * @fileoverview Prefer ternary over complementary && conditions in JSX
 *
 * Detects patterns like:
 *   {isLocked && <LockIcon />}
 *   {!isLocked && <CheckBox />}
 *
 * And suggests:
 *   {isLocked ? <LockIcon /> : <CheckBox />}
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer ternary expression over complementary && conditions in JSX',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      preferTernary:
        "Complementary conditions '{{positive}}' and '!{{positive}}' should use a ternary: `{{positive}} ? ... : ...`",
    },
    schema: [],
  },

  create(context) {
    function getConditionName(node) {
      if (node.type === 'Identifier') return node.name
      if (
        node.type === 'MemberExpression' &&
        !node.computed &&
        node.object.type === 'Identifier' &&
        node.property.type === 'Identifier'
      )
        return `${node.object.name}.${node.property.name}`

      return null
    }

    function getPositiveCondition(expr) {
      if (
        expr.type !== 'LogicalExpression' ||
        expr.operator !== '&&'
      )
        return null

      const { left } = expr

      // Positive: `cond && <JSX />`
      const directName = getConditionName(left)
      if (directName) return { name: directName, isNegated: false }

      // Negated: `!cond && <JSX />`
      if (
        left.type === 'UnaryExpression' &&
        left.operator === '!'
      ) {
        const innerName = getConditionName(left.argument)
        if (innerName) return { name: innerName, isNegated: true }
      }

      return null
    }

    function checkChildren(children) {
      const logicalExpressions = []

      for (const child of children) {
        if (
          child.type === 'JSXExpressionContainer' &&
          child.expression.type === 'LogicalExpression' &&
          child.expression.operator === '&&'
        ) {
          const condition = getPositiveCondition(child.expression)
          if (condition)
            logicalExpressions.push({ node: child, condition })
        }
      }

      // Check all pairs for complementary conditions
      for (let i = 0; i < logicalExpressions.length; i++) {
        for (let j = i + 1; j < logicalExpressions.length; j++) {
          const a = logicalExpressions[i]
          const b = logicalExpressions[j]

          if (a.condition.name !== b.condition.name) continue
          if (a.condition.isNegated === b.condition.isNegated) continue

          // Found complementary pair
          const positiveName = a.condition.name
          context.report({
            node: a.node,
            messageId: 'preferTernary',
            data: { positive: positiveName },
          })
        }
      }
    }

    return {
      JSXElement(node) {
        if (node.children.length > 0)
          checkChildren(node.children)
      },

      JSXFragment(node) {
        if (node.children.length > 0)
          checkChildren(node.children)
      },
    }
  },
}
