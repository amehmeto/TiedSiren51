/**
 * @fileoverview Enforce curly braces with "multi-or-nest" style.
 * Single-statement bodies without nesting can omit braces;
 * multi-statement or nested blocks must use braces.
 * Replaces ESLint's curly rule with multi-or-nest option for OxLint.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce curly braces with multi-or-nest style',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      needsBraces:
        'Expected curly braces around {{ keyword }} body containing multiple statements or nested block.',
      unnecessaryBraces:
        'Unnecessary curly braces around {{ keyword }} body with single non-nested statement.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    function isNested(node) {
      return (
        node.type === 'IfStatement' ||
        node.type === 'ForStatement' ||
        node.type === 'ForInStatement' ||
        node.type === 'ForOfStatement' ||
        node.type === 'WhileStatement' ||
        node.type === 'DoWhileStatement' ||
        node.type === 'TryStatement'
      )
    }

    function checkBody(node, body, keyword) {
      if (!body) return

      if (body.type === 'BlockStatement') {
        // Block with single non-nested statement — braces may be unnecessary
        if (body.body.length === 1 && !isNested(body.body[0])) {
          // Don't flag if the statement spans multiple lines (readability)
          const stmt = body.body[0]
          if (stmt.loc.start.line !== stmt.loc.end.line) return

          context.report({
            node: body,
            messageId: 'unnecessaryBraces',
            data: { keyword },
          })
        }
      } else if (isNested(body)) {
        // Nested control flow without braces — needs braces
        context.report({
          node: body,
          messageId: 'needsBraces',
          data: { keyword },
        })
      }
    }

    return {
      IfStatement(node) {
        checkBody(node, node.consequent, 'if')
        if (node.alternate && node.alternate.type !== 'IfStatement')
          checkBody(node, node.alternate, 'else')
      },
      ForStatement(node) {
        checkBody(node, node.body, 'for')
      },
      ForInStatement(node) {
        checkBody(node, node.body, 'for-in')
      },
      ForOfStatement(node) {
        checkBody(node, node.body, 'for-of')
      },
      WhileStatement(node) {
        checkBody(node, node.body, 'while')
      },
      DoWhileStatement(node) {
        checkBody(node, node.body, 'do-while')
      },
    }
  },
}
