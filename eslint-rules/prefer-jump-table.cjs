/**
 * @fileoverview Prefer object map (jump table) over sequential if statements
 *
 * Flags patterns like:
 *   if (x === 'a') return 1
 *   if (x === 'b') return 2
 *   if (x === 'c') return 3
 *
 * Suggests using an object map instead:
 *   const map = { a: 1, b: 2, c: 3 }
 *   return map[x]
 *
 * Only triggers when:
 *   - 3+ sequential if statements (configurable threshold)
 *   - All test the same variable with ===
 *   - All bodies follow the same structural pattern
 *   - None have an else clause
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer object map (jump table) over sequential if statements testing the same variable',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      preferJumpTable:
        "{{count}} sequential 'if' statements test '{{variable}}' with the same body pattern. Consider using an object map instead.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 2,
            default: 3,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const threshold = options.threshold ?? 3

    function getMemberExpressionText(node) {
      if (node.object.type === 'Identifier' && node.property.type === 'Identifier')
        return `${node.object.name}.${node.property.name}`

      return null
    }

    function getTestedVariable(test) {
      if (test.type !== 'BinaryExpression' || test.operator !== '===')
        return null

      const { left, right } = test

      // x === 'value'
      if (left.type === 'Identifier' && right.type === 'Literal')
        return left.name

      // 'value' === x
      if (right.type === 'Identifier' && left.type === 'Literal')
        return right.name

      // obj.prop === 'value'
      if (
        left.type === 'MemberExpression' &&
        !left.computed &&
        right.type === 'Literal'
      )
        return getMemberExpressionText(left)

      // 'value' === obj.prop
      if (
        right.type === 'MemberExpression' &&
        !right.computed &&
        left.type === 'Literal'
      )
        return getMemberExpressionText(right)

      return null
    }

    function getSingleStatement(consequent) {
      if (consequent.type === 'BlockStatement') {
        if (consequent.body.length !== 1) return null
        return consequent.body[0]
      }
      return consequent
    }

    function getBodyPattern(consequent) {
      const stmt = getSingleStatement(consequent)
      if (!stmt) return null

      if (stmt.type === 'ReturnStatement') return 'return'

      if (
        stmt.type === 'ExpressionStatement' &&
        stmt.expression.type === 'AssignmentExpression' &&
        stmt.expression.operator === '='
      ) {
        if (stmt.expression.left.type === 'Identifier')
          return `assign:${stmt.expression.left.name}`

        return 'assign'
      }

      if (
        stmt.type === 'ExpressionStatement' &&
        stmt.expression.type === 'CallExpression'
      ) {
        const { callee } = stmt.expression
        if (callee.type === 'Identifier') return `call:${callee.name}`

        if (
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.type === 'Identifier'
        )
          return `call:.${callee.property.name}`

        return 'call'
      }

      return null
    }

    function checkStatements(statements) {
      let i = 0
      while (i < statements.length) {
        if (
          statements[i].type !== 'IfStatement' ||
          statements[i].alternate
        ) {
          i++
          continue
        }

        const group = []
        let j = i
        while (
          j < statements.length &&
          statements[j].type === 'IfStatement' &&
          !statements[j].alternate
        ) {
          group.push(statements[j])
          j++
        }

        if (group.length >= threshold) {
          const variables = group.map((s) => getTestedVariable(s.test))
          const firstVar = variables[0]

          if (firstVar && variables.every((v) => v === firstVar)) {
            const patterns = group.map((s) => getBodyPattern(s.consequent))
            const firstPattern = patterns[0]

            if (firstPattern && patterns.every((p) => p === firstPattern)) {
              context.report({
                node: group[0],
                messageId: 'preferJumpTable',
                data: {
                  count: String(group.length),
                  variable: firstVar,
                },
              })
            }
          }
        }

        i = j
      }
    }

    return {
      BlockStatement(node) {
        checkStatements(node.body)
      },
      Program(node) {
        checkStatements(node.body)
      },
    }
  },
}
