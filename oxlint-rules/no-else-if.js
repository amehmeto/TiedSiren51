/**
 * @fileoverview Disallow else-if statements
 *
 * Else-if is syntactic sugar that can always be replaced with separate if statements
 * (when conditions are mutually exclusive) or explicit nested if-else blocks.
 *
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow else-if statements',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      noElseIf:
        'Unexpected else-if. Use separate if statements or nested if-else blocks instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      IfStatement(node) {
        if (node.alternate && node.alternate.type === 'IfStatement') {
          context.report({
            node: node.alternate,
            messageId: 'noElseIf',
          })
        }
      },
    }
  },
}
