/**
 * @fileoverview Require blank line between block-like statements.
 * A "block-like" statement is one that ends with a closing brace.
 * Replaces ESLint's padding-line-between-statements
 * with { blankLine: 'always', prev: 'block-like', next: 'block-like' }.
 * @author TiedSiren
 */

function endsWithBlock(node) {
  if (!node) return false

  if (node.type === 'IfStatement') {
    if (node.alternate) return endsWithBlock(node.alternate)
    return node.consequent.type === 'BlockStatement'
  }

  if (
    node.type === 'ForStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement' ||
    node.type === 'WhileStatement'
  )
    return node.body.type === 'BlockStatement'

  if (node.type === 'DoWhileStatement') return true

  if (node.type === 'TryStatement') return true

  if (node.type === 'FunctionDeclaration') return true
  if (node.type === 'ClassDeclaration') return true

  return false
}

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require blank line between block-like statements',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    messages: {
      missing: 'Expected blank line between block-like statements.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    function checkSiblings(statements) {
      for (let i = 1; i < statements.length; i++) {
        const prev = statements[i - 1]
        const curr = statements[i]

        if (!endsWithBlock(prev) || !endsWithBlock(curr)) continue

        const prevEnd = prev.loc.end.line
        const currStart = curr.loc.start.line
        const gap = currStart - prevEnd

        if (gap < 2)
          context.report({
            node: curr,
            messageId: 'missing',
            fix(fixer) {
              const tokenAfterPrev = sourceCode.getTokenAfter(prev)
              return fixer.insertTextBefore(tokenAfterPrev || curr, '\n')
            },
          })
      }
    }

    return {
      Program(node) {
        checkSiblings(node.body)
      },
      BlockStatement(node) {
        checkSiblings(node.body)
      },
    }
  },
}
