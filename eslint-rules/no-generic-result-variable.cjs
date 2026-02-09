/**
 * @fileoverview Disallow generic "result" variable name in tests
 *
 * The Act phase result should carry the intent of the action.
 * Use the verb from the function call (e.g., blockCats() → blockedCats)
 * or the "retrievedXxx" pattern (e.g., retrievedUser).
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow generic "result" variable name — use a descriptive name derived from the action',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noGenericResult:
        "Avoid generic variable name 'result'. Use a name derived from the action (e.g., blockedCats for blockCats()) or the 'retrievedXxx' pattern.",
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        if (node.id.name === 'result') {
          context.report({
            node: node.id,
            messageId: 'noGenericResult',
          })
        }
      },
    }
  },
}
