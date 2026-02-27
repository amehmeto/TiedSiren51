/**
 * @fileoverview Enforce a maximum number of statements per line.
 * Replaces ESLint's max-statements-per-line for OxLint.
 * Only counts direct children of block scopes (not nested).
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a maximum number of statements per line',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      tooMany:
        'This line has {{ count }} statements. Maximum allowed is {{ max }}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'integer', minimum: 1, default: 1 },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const max = (context.options[0] && context.options[0].max) || 1

    function checkStatements(statements) {
      const perLine = new Map()

      for (const stmt of statements) {
        if (stmt.type === 'EmptyStatement') continue
        const line = stmt.loc.start.line
        if (!perLine.has(line)) perLine.set(line, [])
        perLine.get(line).push(stmt)
      }

      for (const [, stmts] of perLine)
        if (stmts.length > max)
          context.report({
            node: stmts[max],
            messageId: 'tooMany',
            data: { count: String(stmts.length), max: String(max) },
          })
    }

    return {
      Program(node) {
        checkStatements(node.body)
      },
      BlockStatement(node) {
        checkStatements(node.body)
      },
    }
  },
}
