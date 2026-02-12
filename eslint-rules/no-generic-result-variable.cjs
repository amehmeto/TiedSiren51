/**
 * @fileoverview Disallow generic variable names in tests
 *
 * The Act phase result should carry the intent of the action.
 * Use the verb from the function call (e.g., blockCats() → blockedCats)
 * or the "retrievedXxx" pattern (e.g., retrievedUser).
 *
 * @author TiedSiren
 */

const DEFAULT_FORBIDDEN_NAMES = ['result', 'res', 'ret', 'output']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow generic variable names — use a descriptive name derived from the action',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noGenericResult:
        "Avoid generic variable name '{{name}}'. Use a name derived from the action (e.g., blockedCats for blockCats()) or the 'retrievedXxx' pattern.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          forbidden: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const forbidden = new Set(options.forbidden ?? DEFAULT_FORBIDDEN_NAMES)

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        if (forbidden.has(node.id.name)) {
          context.report({
            node: node.id,
            messageId: 'noGenericResult',
            data: { name: node.id.name },
          })
        }
      },
    }
  },
}
