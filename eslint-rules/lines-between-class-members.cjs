/**
 * @fileoverview Require blank lines between class members.
 * Replaces ESLint's lines-between-class-members for OxLint.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require blank lines between class members',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'whitespace',
    messages: {
      missing: 'Expected blank line between class members.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      ClassBody(node) {
        const members = node.body
        for (let i = 1; i < members.length; i++) {
          const prev = members[i - 1]
          const curr = members[i]

          // Skip single-line field declarations followed by another single-line field
          const prevIsOneLine = prev.loc.start.line === prev.loc.end.line
          const currIsOneLine = curr.loc.start.line === curr.loc.end.line
          if (prevIsOneLine && currIsOneLine) continue

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
      },
    }
  },
}
